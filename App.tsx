import React, { useState, useEffect, useRef } from 'react';
import { englishDefinitions, examples, vocabulary } from './data';
import { smartShuffle } from './utils';
import { GameState, WordData, WrongAnswer, MatchingCard, LeaderboardEntry } from './types';
import TechOrb from './components/TechOrb';
import { CorrectModal, ExampleModal, WrongModal, CreditsModal, QuitModal } from './components/Modals';

// --- Helper Functions for Matching Game ---
const generateMatchingCards = (count: number): MatchingCard[] => {
  // Shuffle full vocabulary and pick 'count' items
  const selectedVocab = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, count);
  
  const cards: MatchingCard[] = [];
  selectedVocab.forEach((item, index) => {
    const match = item.definition.match(/^(\([a-z]+\.?\s*(?:\[.*?\])?\))\s*(.*)/);
    const pos = match ? match[1] : "";
    const cleanDef = match ? match[2] : item.definition;

    cards.push({
      id: `en-${index}`,
      word: item.word + item.definition,
      content: `${item.word}\n${pos}`,
      type: 'EN',
      isMatched: false
    });

    cards.push({
      id: `cn-${index}`,
      word: item.word + item.definition,
      content: cleanDef,
      type: 'CN',
      isMatched: false
    });
  });

  return cards.sort(() => 0.5 - Math.random());
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${Number(secs) < 10 ? '0' : ''}${secs}`;
};

const App: React.FC = () => {
  // --- Global Navigation State ---
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [homeCarouselIndex, setHomeCarouselIndex] = useState<number>(0);
  const [showCredits, setShowCredits] = useState<boolean>(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);

  // --- Home Animation State ---
  const [isRoaming, setIsRoaming] = useState<boolean>(false);
  const [icon1Pos, setIcon1Pos] = useState({ x: 0, y: 0, r: -12 });
  const [icon2Pos, setIcon2Pos] = useState({ x: 0, y: 0, r: 12 });
  const roamingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Spelling Game State (Mode 1) ---
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [customCountInput, setCustomCountInput] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  
  const [spellingVocab, setSpellingVocab] = useState<WordData[]>([]);
  const [spellingIndex, setSpellingIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [mistakes, setMistakes] = useState<number>(0);
  const [currentQuestionMistakes, setCurrentQuestionMistakes] = useState<number>(0);
  const [extraHints, setExtraHints] = useState<number>(0);
  const [showEnglishDef, setShowEnglishDef] = useState<boolean>(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isErrorAnimating, setIsErrorAnimating] = useState<boolean>(false);
  const [showMistakeOrb, setShowMistakeOrb] = useState<boolean>(false);
  
  const [modalState, setModalState] = useState<'none' | 'correct' | 'wrong' | 'example'>('none');
  const [flashScore, setFlashScore] = useState<boolean>(false);
  const [hasViewedExample, setHasViewedExample] = useState<boolean>(false);
  
  const definitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Matching Game State (Mode 2) ---
  const [matchingCards, setMatchingCards] = useState<MatchingCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchingCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [matchingStartTime, setMatchingStartTime] = useState<number>(0);
  const [matchingCurrentTime, setMatchingCurrentTime] = useState<number>(0);
  const matchingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Multiplayer Specific
  // Removed totalChallengers limit. It's now an endless loop until user quits.
  const [currentChallengerName, setCurrentChallengerName] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Dual Player Specific
  const [dualP1Cards, setDualP1Cards] = useState<MatchingCard[]>([]);
  const [dualP2Cards, setDualP2Cards] = useState<MatchingCard[]>([]);
  const [dualP1Selected, setDualP1Selected] = useState<MatchingCard[]>([]);
  const [dualP2Selected, setDualP2Selected] = useState<MatchingCard[]>([]);
  const [dualP1Matches, setDualP1Matches] = useState<number>(0);
  const [dualP2Matches, setDualP2Matches] = useState<number>(0);
  const [dualWinner, setDualWinner] = useState<'P1' | 'P2' | null>(null);


  // --- Logic: Abort ---
  const handleAbortGame = () => {
    setShowQuitConfirm(true);
  };

  const confirmAbort = () => {
    setShowQuitConfirm(false);
    setGameState(GameState.HOME);
    // Reset timers just in case
    if (matchingTimerRef.current) clearInterval(matchingTimerRef.current);
    if (definitionTimerRef.current) clearTimeout(definitionTimerRef.current);
  };

  // --- Logic: Home Animation ---
  const triggerRoaming = () => {
    if (roamingTimeoutRef.current) clearTimeout(roamingTimeoutRef.current);
    if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);

    setIsRoaming(true);
    
    // Move immediately
    moveIcons();

    // Move periodically
    moveIntervalRef.current = setInterval(moveIcons, 2000);

    // Stop after 10 seconds
    roamingTimeoutRef.current = setTimeout(() => {
      setIsRoaming(false);
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
      // Reset to initial positions
      setIcon1Pos({ x: 0, y: 0, r: -12 });
      setIcon2Pos({ x: 0, y: 0, r: 12 });
    }, 10000);
  };

  const moveIcons = () => {
    // Random positions relative to viewport center roughly
    const rangeX = window.innerWidth * 0.4;
    const rangeY = window.innerHeight * 0.3;
    
    setIcon1Pos({
      x: (Math.random() - 0.5) * 2 * rangeX,
      y: (Math.random() - 0.5) * 2 * rangeY,
      r: (Math.random() * 60) - 30
    });
    setIcon2Pos({
      x: (Math.random() - 0.5) * 2 * rangeX,
      y: (Math.random() - 0.5) * 2 * rangeY,
      r: (Math.random() * 60) - 30
    });
  };

  useEffect(() => {
    if (gameState === GameState.HOME) {
        triggerRoaming();
    } else {
        setIsRoaming(false);
        if (roamingTimeoutRef.current) clearTimeout(roamingTimeoutRef.current);
        if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    }
    return () => {
        if (roamingTimeoutRef.current) clearTimeout(roamingTimeoutRef.current);
        if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    };
  }, [gameState]);


  // --- Logic: Home & Navigation ---

  const renderHome = () => {
    const modes = [
      {
        title: "看圖拼字",
        desc: "觀察圖片與提示，拼出正確單字",
        action: () => setGameState(GameState.SPELLING_SETUP),
        icon: "🖼️"
      },
      {
        title: "中英配對",
        desc: "挑戰速度！將英文單字與中文定義配對",
        action: () => setGameState(GameState.MATCHING_MENU),
        icon: "⚡"
      }
    ];

    const currentMode = modes[homeCarouselIndex];

    return (
      <div className="h-[100svh] w-full flex flex-col items-center justify-start pt-16 p-4 pb-[env(safe-area-inset-bottom)] relative overflow-hidden">
        
        {/* Title Block with Icons Outside */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-12 z-10 w-full max-w-5xl px-2 relative">
            {/* Left Icon */}
            <div 
                onClick={triggerRoaming}
                style={{ 
                    transform: `translate(${icon1Pos.x}px, ${icon1Pos.y}px) rotate(${icon1Pos.r}deg)`,
                    transition: isRoaming ? 'all 2s ease-in-out' : 'all 1s ease-out'
                }}
                className="text-5xl sm:text-7xl lg:text-8xl filter drop-shadow-2xl cursor-pointer z-50 hover:scale-110 active:scale-90"
            >
                🐘
            </div>

            {/* Title Box */}
            <div className="bg-black/20 backdrop-blur-md border-4 border-white/50 rounded-3xl p-6 sm:p-10 shadow-2xl animate-bounce-custom flex-1 flex justify-center min-w-0 overflow-hidden">
                <h1 className="font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] whitespace-normal break-words text-center text-2xl sm:text-4xl md:text-5xl lg:text-7xl tracking-wider leading-tight">
                    B3L8 Elephant Abuse
                </h1>
            </div>

            {/* Right Icon */}
            <div 
                onClick={triggerRoaming}
                style={{ 
                    transform: `translate(${icon2Pos.x}px, ${icon2Pos.y}px) rotate(${icon2Pos.r}deg)`,
                    transition: isRoaming ? 'all 2s ease-in-out' : 'all 1s ease-out'
                }}
                className="text-5xl sm:text-7xl lg:text-8xl filter drop-shadow-2xl cursor-pointer z-50 hover:scale-110 active:scale-90"
            >
                💔
            </div>
        </div>

        {/* Carousel */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-4 z-10">
          <button 
            onClick={() => setHomeCarouselIndex(prev => (prev === 0 ? modes.length - 1 : prev - 1))}
            className="p-4 bg-white/30 hover:bg-white/50 rounded-full text-white text-3xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
          >
            ◀
          </button>

          <div 
            onClick={currentMode.action}
            className="flex-1 bg-white/80 backdrop-blur-md border-4 border-white rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)] cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95 group flex flex-col items-center text-center"
          >
            <div className="text-6xl mb-4 transform transition-transform group-hover:rotate-12">{currentMode.icon}</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">{currentMode.title}</h2>
            <p className="text-gray-600 text-lg sm:text-xl">{currentMode.desc}</p>
            <div className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-full font-bold shadow-md group-hover:bg-blue-600">
              START
            </div>
          </div>

          <button 
            onClick={() => setHomeCarouselIndex(prev => (prev === modes.length - 1 ? 0 : prev + 1))}
            className="p-4 bg-white/30 hover:bg-white/50 rounded-full text-white text-3xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
          >
            ▶
          </button>
        </div>

        {/* Designer Credit */}
        <div 
          onClick={() => setShowCredits(true)}
          className="absolute bottom-4 left-4 mb-[env(safe-area-inset-bottom)] px-4 py-2 bg-black/80 hover:bg-black backdrop-blur-sm rounded-full text-white cursor-pointer transition-all border-2 border-white/20 text-xs sm:text-sm font-bold shadow-lg hover:scale-105 active:scale-95 z-50 tracking-widest"
        >
          設計者
        </div>
        {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
      </div>
    );
  };

  const renderMatchingMenu = () => {
    return (
      <div className="h-[100svh] w-full flex flex-col items-center justify-start pt-16 p-4">
        {/* Title Bar */}
        <div className="w-full max-w-5xl mx-auto mb-10 flex items-center justify-center">
           <div className="bg-black/20 backdrop-blur-md border-4 border-white/50 rounded-3xl p-4 sm:p-6 shadow-xl relative">
             <button 
                onClick={() => setGameState(GameState.HOME)}
                className="absolute left-[-60px] top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl backdrop-blur-sm transition-all"
             >
               ↩
             </button>
             <h1 className="font-bold text-white drop-shadow-md text-3xl sm:text-5xl tracking-widest">
               中英配對
             </h1>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 w-full max-w-4xl justify-center items-stretch">
          <div 
            onClick={() => {
              setCustomCountInput("");
              // Default to 10 pairs (20 cards)
              setQuestionCount(10); 
              setGameState(GameState.MATCHING_SINGLE_SETUP_GLOBAL);
            }}
            className="flex-1 bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all flex flex-col items-center justify-center min-h-[250px]"
          >
            <span className="text-6xl mb-4">👥</span>
            <h3 className="text-3xl font-bold text-blue-900">多人挑戰</h3>
            <p className="text-blue-700 mt-2 text-center">計時挑戰賽<br/>輪流挑戰排行榜</p>
          </div>

          <div 
             onClick={() => {
               setCustomCountInput("");
               setQuestionCount(9); // Default to 9 for dual
               setGameState(GameState.MATCHING_DUAL_SETUP);
             }}
             className="flex-1 bg-gradient-to-br from-red-100 to-red-200 border-4 border-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all flex flex-col items-center justify-center min-h-[250px]"
          >
            <span className="text-6xl mb-4">⚔️</span>
            <h3 className="text-3xl font-bold text-red-900">雙人對戰</h3>
            <p className="text-red-700 mt-2 text-center">分割畫面<br/>速度對決</p>
          </div>
        </div>
      </div>
    );
  };

  // --- Logic: Spelling Game (Mode 1) ---

  const startSpellingGame = (count: number) => {
    const items = smartShuffle([...vocabulary], count).map(item => ({
      ...item,
      englishDef: item.englishDef || englishDefinitions[item.word],
      example: item.example || examples[item.word]
    }));
    setSpellingVocab(items);
    setQuestionCount(count);
    setGameState(GameState.SPELLING_PLAYING);
    setSpellingIndex(0);
    setMistakes(0);
    setWrongAnswers([]);
    resetSpellingQuestion();
  };

  const resetSpellingQuestion = () => {
    setUserInput("");
    setCurrentQuestionMistakes(0);
    setExtraHints(0);
    setShowEnglishDef(false);
    setModalState('none');
    setHasViewedExample(false);
    
    if (definitionTimerRef.current) clearTimeout(definitionTimerRef.current);
    definitionTimerRef.current = setTimeout(() => {
      setShowEnglishDef(true);
    }, 10000);
    
    if (window.innerWidth >= 768) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Spelling Render Helpers
  const getSpellingWordStyles = (length: number) => {
     // Configured to ensure "one line" display by scaling down font and spacing for longer words
     // Uses standard Tailwind classes with responsive variants
     
     if (length <= 6) {
         return { 
             fontClass: "text-4xl sm:text-6xl md:text-7xl", 
             borderClass: "border-b-4 sm:border-b-8 w-10 sm:w-20 mx-1 sm:mx-2" 
         };
     } else if (length <= 9) {
         return { 
             fontClass: "text-3xl sm:text-5xl md:text-6xl", 
             borderClass: "border-b-4 sm:border-b-6 w-8 sm:w-14 mx-0.5 sm:mx-1.5" 
         };
     } else if (length <= 12) {
         return { 
             fontClass: "text-2xl sm:text-4xl md:text-5xl", 
             borderClass: "border-b-2 sm:border-b-4 w-6 sm:w-10 mx-0.5 sm:mx-1" 
         };
     } else {
         // Very long words - shrink more to fit single line
         return { 
             fontClass: "text-xl sm:text-3xl md:text-4xl", 
             borderClass: "border-b-2 sm:border-b-4 w-5 sm:w-8 mx-[1px]" 
         };
     }
  };

  const renderSpellingHint = () => {
    const wordData = spellingVocab[spellingIndex];
    if (!wordData) return null;
    const styles = getSpellingWordStyles(wordData.word.length);
    const hintsToShow = 1 + currentQuestionMistakes + extraHints;
    
    return wordData.word.split('').map((char, index) => {
      let content;
      let styleClass = `${styles.borderClass} inline-block text-center transition-all`;
      if (index < userInput.length) {
        content = userInput[index];
        styleClass += " border-gray-800 text-black";
      } else if (index < hintsToShow) {
        content = char;
        styleClass += " text-gray-700 border-gray-500";
      } else {
        content = "_";
        styleClass += " text-transparent border-gray-500";
      }
      return <span key={index} className={styleClass}>{content}</span>;
    });
  };

  // --- Logic: Matching Game (Common) ---
  const handleCardClick = (card: MatchingCard, 
    currentSelected: MatchingCard[], 
    setCurrentSelected: React.Dispatch<React.SetStateAction<MatchingCard[]>>,
    allCards: MatchingCard[],
    setAllCards: React.Dispatch<React.SetStateAction<MatchingCard[]>>,
    setMatchedCount: React.Dispatch<React.SetStateAction<number>>,
    onMatch?: () => void
  ) => {
    if (card.isMatched || currentSelected.find(c => c.id === card.id) || currentSelected.length >= 2) return;

    const newSelected = [...currentSelected, card];
    setCurrentSelected(newSelected);

    if (newSelected.length === 2) {
      const [c1, c2] = newSelected;
      if (c1.word === c2.word && c1.type !== c2.type) {
        // Match!
        setAllCards(prev => prev.map(c => (c.id === c1.id || c.id === c2.id) ? { ...c, isMatched: true } : c));
        setMatchedCount(prev => prev + 1);
        setCurrentSelected([]);
        if (onMatch) onMatch();
      } else {
        // Mismatch
        setTimeout(() => {
          setCurrentSelected([]);
        }, 800);
      }
    }
  };

  // --- Logic: Matching Single Player ---
  
  const startSingleMatchingRound = () => {
    const cards = generateMatchingCards(questionCount);
    setMatchingCards(cards);
    setSelectedCards([]);
    setMatchedPairs(0);
    setMatchingCurrentTime(0);
    setGameState(GameState.MATCHING_SINGLE_PLAYING);
    setMatchingStartTime(Date.now());
    
    if (matchingTimerRef.current) clearInterval(matchingTimerRef.current);
    matchingTimerRef.current = setInterval(() => {
      setMatchingCurrentTime((Date.now() - matchingStartTime) / 1000); 
    }, 100);
  };

  useEffect(() => {
    if (gameState === GameState.MATCHING_SINGLE_PLAYING) {
      const start = Date.now();
      matchingTimerRef.current = setInterval(() => {
        setMatchingCurrentTime((Date.now() - start) / 1000);
      }, 100);
    } else {
      if (matchingTimerRef.current) clearInterval(matchingTimerRef.current);
    }
    return () => { if (matchingTimerRef.current) clearInterval(matchingTimerRef.current); };
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.MATCHING_SINGLE_PLAYING && matchedPairs > 0 && matchedPairs === questionCount) {
      // Round Finished
      if (matchingTimerRef.current) clearInterval(matchingTimerRef.current);
      
      const timeTaken = matchingCurrentTime;
      const newEntry: LeaderboardEntry = { studentId: currentChallengerName, timeTaken };
      
      // Update Leaderboard
      setLeaderboard(prev => {
        const newList = [...prev, newEntry].sort((a, b) => a.timeTaken - b.timeTaken);
        return newList;
      });

      setGameState(GameState.MATCHING_SINGLE_RESULT);
    }
  }, [matchedPairs, gameState]);


  // --- Logic: Matching Dual Player ---

  const startDualMatching = (count: number) => {
    setQuestionCount(count);
    const cardsP1 = generateMatchingCards(count);
    const cardsP2 = JSON.parse(JSON.stringify(cardsP1)).sort(() => 0.5 - Math.random());
    
    setDualP1Cards(cardsP1);
    setDualP2Cards(cardsP2);
    setDualP1Selected([]);
    setDualP2Selected([]);
    setDualP1Matches(0);
    setDualP2Matches(0);
    setDualWinner(null);
    setGameState(GameState.MATCHING_DUAL_PLAYING);
  };

  useEffect(() => {
    if (gameState === GameState.MATCHING_DUAL_PLAYING) {
      if (dualP1Matches === questionCount && dualWinner === null) {
        setDualWinner('P1');
      } else if (dualP2Matches === questionCount && dualWinner === null) {
        setDualWinner('P2');
      }
    }
  }, [dualP1Matches, dualP2Matches, gameState, questionCount]);


  // --- Render Sections ---

  if (gameState === GameState.HOME) return renderHome();

  // --- Render: Spelling Setup ---
  if (gameState === GameState.SPELLING_SETUP) {
    return (
      <div className="h-[100svh] w-full flex flex-col items-center justify-start pt-10 sm:pt-14 p-4 pb-[env(safe-area-inset-bottom)] overflow-y-auto">
         <div className="w-full max-w-5xl mx-auto mb-8 sm:mb-10 flex items-center justify-center">
          <div className="bg-black/20 backdrop-blur-md border-4 border-white/50 rounded-3xl p-4 sm:p-6 shadow-xl relative">
            <button 
                onClick={() => setGameState(GameState.HOME)}
                className="absolute left-[-60px] top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl backdrop-blur-sm transition-all"
             >
               ↩
             </button>
            <h1 className="font-bold text-white drop-shadow-md text-3xl sm:text-5xl tracking-widest">
              看圖拼字
            </h1>
          </div>
        </div>
        
        <div className="marshmallow-bg p-6 sm:p-8 w-full max-w-2xl shadow-xl animate-fade-in rounded-3xl">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-800">
            Choose Number of Questions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[5, 10, 15].map(num => (
              <button key={num} onClick={() => startSpellingGame(num)} className="bg-white border-2 border-gray-100 text-gray-700 font-bold py-3 sm:py-4 rounded-xl text-xl sm:text-2xl lg:text-4xl shadow-sm hover:bg-blue-50 hover:border-blue-200">
                {num} 題
              </button>
            ))}
            <button onClick={() => setShowCustomInput(true)} className="bg-white border-2 border-gray-100 text-gray-700 font-bold py-3 sm:py-4 rounded-xl text-xl sm:text-2xl hover:bg-blue-50">
              自訂
            </button>
          </div>
          {showCustomInput && (
            <div className="flex flex-col items-center animate-fade-in gap-4">
              <div className="flex items-center gap-4">
                <input type="number" min="1" max="50" value={customCountInput} onChange={(e) => setCustomCountInput(e.target.value)} className="w-24 p-2 text-center text-2xl border-2 border-gray-300 rounded-lg" />
                <button onClick={() => { const num = parseInt(customCountInput); if (num > 0 && num <= 50) startSpellingGame(num); }} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold text-xl">GO</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Render: Spelling Playing ---
  if (gameState === GameState.SPELLING_PLAYING) {
     const currentWordData = spellingVocab[spellingIndex];
     const styles = currentWordData ? getSpellingWordStyles(currentWordData.word.length) : { fontClass: "", borderClass: "" };
     const progressPercentage = ((spellingIndex + 1) / questionCount) * 100;

     // Extract Part of Speech for display
     const posMatch = currentWordData ? currentWordData.definition.match(/^(\([a-z]+\.?\s*(?:\[.*?\])?\))/) : null;
     const pos = posMatch ? posMatch[1] : "";

     return (
       <div className="h-[100svh] w-full flex flex-col relative overflow-hidden bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-300">
         
         {/* Quit Button */}
         <button 
           onClick={handleAbortGame}
           className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500/80 hover:bg-red-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-50 transition-all"
         >
           ✕
         </button>

         {showQuitConfirm && <QuitModal onConfirm={confirmAbort} onCancel={() => setShowQuitConfirm(false)} />}

         <div className="flex-1 w-full h-full flex flex-col items-center justify-center pt-2 pb-safe">
            <div className="w-full max-w-[1920px] mx-auto flex flex-col md:flex-row items-center md:items-stretch justify-center">
                {/* Left: Def & Images */}
                <div className="w-full md:w-1/2 flex flex-col items-center border-b-4 md:border-b-0 border-white/30 md:border-r-8 md:pr-4 md:pl-12 pb-2">
                    <div className="w-full max-w-xl flex flex-col gap-2 px-4">
                        <div className="bg-green-50/90 backdrop-blur-sm px-2 py-1 rounded-3xl text-center flex items-center justify-center min-h-[5rem] sm:min-h-[6rem] h-auto relative border-2 border-green-200 shadow-md">
                             <p className={`font-semibold leading-tight ${showEnglishDef ? 'text-green-900 text-2xl sm:text-3xl lg:text-4xl' : 'text-green-700 font-bold animate-flash-text text-3xl sm:text-5xl'}`}>
                                {showEnglishDef ? currentWordData.englishDef : "GUESS THE WORD"}
                             </p>
                             {!showEnglishDef && <div className="absolute bottom-0 left-0 h-1.5 bg-green-400 animate-countdown"></div>}
                        </div>
                        <div className="relative grid grid-cols-2 gap-3 w-full">
                           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                              {!showMistakeOrb ? <TechOrb value={`${spellingIndex + 1}/${questionCount}`} positionClass="" colorClass="bg-blue-500" progress={progressPercentage} /> : <TechOrb value={mistakes} positionClass="" colorClass={`bg-red-500 ${isErrorAnimating ? 'animate-shake' : ''}`} />}
                           </div>
                           {currentWordData.images.slice(0, 4).map((img, idx) => (
                             <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm flex items-center justify-center text-[3.5rem] sm:text-[5rem] aspect-square animate-bounce-custom">{img}</div>
                           ))}
                        </div>
                    </div>
                </div>
                {/* Right: Input */}
                <div className="w-full md:w-1/2 max-w-4xl px-2 flex flex-col items-center justify-center md:justify-start relative mt-4 md:mt-0">
                   <div className={`w-full max-w-xl bg-white p-6 rounded-3xl shadow-lg border-4 border-green-200 relative ${isInputFocused ? 'ring-4 ring-green-300' : ''}`}>
                      <button onClick={() => { setExtraHints(h => h + 1); inputRef.current?.focus(); }} className="absolute -top-5 -left-5 w-16 h-16 rounded-full bg-purple-500 text-white font-bold border-4 border-white shadow-lg text-lg hover:scale-110 transition-transform">+1</button>
                      
                      {/* POS Tag Display */}
                      <div className="w-full text-center mb-2">
                          <span className="text-gray-500 font-bold text-xl sm:text-2xl">{pos}</span>
                      </div>

                      <div className="mt-2 mb-4 text-center cursor-text min-h-[100px] flex items-center justify-center" onClick={() => inputRef.current?.focus()}>
                         <div className={`flex flex-nowrap justify-center items-end ${styles.fontClass} font-mono font-bold text-gray-900 w-full overflow-hidden`}>
                           {renderSpellingHint()}
                         </div>
                      </div>
                      <input ref={inputRef} type="text" value={userInput} onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          if (/^[a-z]*$/.test(val) && val.length <= currentWordData.word.length) {
                             setUserInput(val);
                             if (val.length === currentWordData.word.length) {
                                if (val === currentWordData.word.toLowerCase()) {
                                   setModalState('correct'); setFlashScore(true); setTimeout(() => setFlashScore(false), 2000);
                                } else {
                                   setMistakes(m => m + 1); setCurrentQuestionMistakes(m => m + 1); setModalState('wrong');
                                   setIsErrorAnimating(true); setShowMistakeOrb(true); setTimeout(() => { setIsErrorAnimating(false); }, 500); setTimeout(() => setShowMistakeOrb(false), 2000);
                                   setWrongAnswers(prev => [...prev.filter(w => w.word !== currentWordData.word), { word: currentWordData.word, definition: currentWordData.definition, mistakes: (prev.find(w => w.word === currentWordData.word)?.mistakes || 0) + 1 }]);
                                }
                             }
                          }
                      }} onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} className="opacity-0 absolute inset-0 w-full h-full cursor-default" style={{fontSize: '16px'}} autoComplete="off" />
                   </div>
                </div>
            </div>
            
            {modalState === 'correct' && <CorrectModal wordData={currentWordData} englishDef={currentWordData.englishDef} onNext={() => {
                if (spellingIndex < spellingVocab.length - 1) {
                   setSpellingIndex(prev => prev + 1); resetSpellingQuestion();
                } else {
                   setGameState(GameState.SPELLING_REVIEW);
                }
            }} onShowExample={() => { setHasViewedExample(true); setModalState('example'); }} hasViewedExample={hasViewedExample} />}
            {modalState === 'wrong' && <WrongModal onClose={() => { setModalState('none'); setUserInput(""); inputRef.current?.focus(); }} />}
            {modalState === 'example' && <ExampleModal wordData={currentWordData} onClose={() => setModalState('correct')} />}
            {flashScore && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] font-bold text-red-500 animate-flash-score pointer-events-none">+2</div>}
         </div>
       </div>
     );
  }

  // --- Render: Spelling Review ---
  if (gameState === GameState.SPELLING_REVIEW) {
      const sortedMistakes = [...wrongAnswers].sort((a, b) => b.mistakes - a.mistakes);
      return (
        <div className="h-[100svh] w-full flex flex-col items-center justify-start pt-12 p-4 overflow-y-auto">
          <div className="marshmallow-bg p-8 w-full max-w-4xl shadow-xl rounded-2xl">
             <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">Review Time!</h2>
             {sortedMistakes.length === 0 ? <div className="text-center text-3xl text-green-600 font-bold py-10">Perfect! 🎉</div> : (
               <div className="space-y-4">
                 {sortedMistakes.map((item, idx) => (
                   <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                     <div><div className="text-2xl font-bold">{item.word}</div><div className="text-gray-500">{item.definition}</div></div>
                     <span className="text-red-500 font-bold text-xl">{item.mistakes} mistakes</span>
                   </div>
                 ))}
               </div>
             )}
             <button onClick={() => { setGameState(GameState.SPELLING_SETUP); }} className="w-full mt-6 bg-blue-500 text-white font-bold py-4 rounded-xl text-2xl hover:bg-blue-600">Play Again</button>
             <button onClick={() => { setGameState(GameState.HOME); }} className="w-full mt-4 bg-gray-500 text-white font-bold py-4 rounded-xl text-2xl hover:bg-gray-600">Back to Home</button>
          </div>
        </div>
      );
  }

  if (gameState === GameState.MATCHING_MENU) return renderMatchingMenu();

  // --- Mode 2: Multiplayer Setup ---
  if (gameState === GameState.MATCHING_SINGLE_SETUP_GLOBAL) {
    return (
      <div className="h-[100svh] w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 text-blue-900">多人挑戰設定</h2>
          
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-700 mb-2">每人題目數 (對數)</label>
            <div className="flex justify-center gap-2 flex-wrap">
               <button onClick={() => setQuestionCount(10)} className={`px-4 py-2 rounded-lg border-2 font-bold ${questionCount === 10 ? 'bg-blue-500 text-white border-blue-500 shadow-md ring-2 ring-blue-300' : 'bg-white text-gray-600 border-gray-200'}`}>10題 (20張)</button>
               <button onClick={() => setQuestionCount(12)} className={`px-4 py-2 rounded-lg border-2 font-bold ${questionCount === 12 ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200'}`}>12題</button>
               <input 
                 type="number" 
                 placeholder="自訂" 
                 className={`w-20 p-2 border-2 rounded-lg text-center font-bold ${[10,12].includes(questionCount) ? 'border-gray-200' : 'border-blue-500 text-blue-600'}`}
                 onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)} 
               />
            </div>
            <p className="text-sm text-gray-500 mt-2">建議選擇 "10題" 以獲得最佳全螢幕體驗</p>
          </div>

          <button 
             onClick={() => {
               if (questionCount > 0) {
                 setLeaderboard([]);
                 setGameState(GameState.MATCHING_SINGLE_PLAYER_ENTRY);
               } else {
                 alert("請輸入有效的題數");
               }
             }}
             className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-xl hover:bg-blue-700 shadow-lg"
          >
            下一步
          </button>
          <button onClick={() => setGameState(GameState.MATCHING_MENU)} className="mt-4 text-gray-500 underline">取消</button>
        </div>
      </div>
    );
  }

  // --- Mode 2: Multiplayer Entry ---
  if (gameState === GameState.MATCHING_SINGLE_PLAYER_ENTRY) {
    return (
      <div className="h-[100svh] w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg text-center animate-fade-in relative">
          
          <button onClick={() => setGameState(GameState.HOME)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

          <div className="mb-4 text-blue-500 font-bold uppercase tracking-widest">
            Next Challenger
          </div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">輸入挑戰者資訊</h2>
          
          <input 
            type="text" 
            value={currentChallengerName} 
            onChange={(e) => setCurrentChallengerName(e.target.value)} 
            className="w-full p-4 border-4 border-blue-200 rounded-2xl text-2xl text-center font-bold mb-8 focus:border-blue-500 outline-none placeholder:text-gray-300 placeholder:text-lg" 
            placeholder="班級座號(5碼) 或 姓名"
            autoFocus
          />

          <button 
             onClick={() => {
               if (currentChallengerName.trim().length > 0) {
                 startSingleMatchingRound();
               } else {
                 alert("請輸入挑戰者名稱");
               }
             }}
             className="w-full bg-green-500 text-white font-bold py-4 rounded-xl text-2xl hover:bg-green-600 shadow-lg transform hover:scale-105 transition-all"
          >
            開始挑戰 (Start)
          </button>
        </div>

        {/* Mini Leaderboard Preview */}
        {leaderboard.length > 0 && (
          <div className="mt-8 w-full max-w-lg bg-white/50 backdrop-blur-md rounded-xl p-4">
             <h3 className="text-center font-bold text-gray-700 mb-2">目前排名</h3>
             <div className="flex gap-2 overflow-x-auto pb-2">
                {leaderboard.map((entry, idx) => (
                  <div key={idx} className="flex-shrink-0 bg-white p-2 rounded-lg shadow-sm border border-gray-200 min-w-[80px] text-center">
                    <div className="text-xs text-gray-500">#{idx + 1}</div>
                    <div className="font-bold text-blue-800 truncate max-w-[80px]">{entry.studentId}</div>
                    <div className="text-green-600 font-mono text-sm">{formatTime(entry.timeTaken)}</div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    );
  }

  // --- Mode 2: Multiplayer Playing ---
  if (gameState === GameState.MATCHING_SINGLE_PLAYING) {
     return (
       <div className="h-[100svh] w-full flex flex-col bg-gray-100 overflow-hidden relative">
          
          {showQuitConfirm && <QuitModal onConfirm={confirmAbort} onCancel={() => setShowQuitConfirm(false)} />}

          {/* Top Bar: Leaderboard & Timer */}
          <div className="bg-white shadow-md p-2 flex items-center justify-between z-10 flex-shrink-0">
             <div className="flex-1 overflow-hidden flex items-center gap-2">
                <span className="font-bold text-gray-400 text-xs sm:text-sm uppercase hidden sm:inline">Leaderboard:</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                   {leaderboard.slice(0, 5).map((entry, idx) => (
                     <div key={idx} className="flex-shrink-0 bg-gray-50 px-2 py-1 rounded border text-xs sm:text-sm whitespace-nowrap">
                       <span className="font-bold text-blue-600 mr-1">{idx+1}. {entry.studentId}</span>
                       <span className="font-mono text-green-600">{formatTime(entry.timeTaken)}</span>
                     </div>
                   ))}
                </div>
             </div>
             
             {/* Timer Group with Quit Button on Left */}
             <div className="flex items-center gap-2 ml-2">
                 <button 
                   onClick={handleAbortGame}
                   className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all flex-shrink-0"
                 >
                   ✕
                 </button>
                 <div className="flex-shrink-0 bg-black text-green-400 font-mono text-2xl px-4 py-1 rounded-lg shadow-inner min-w-[100px] text-center">
                    {formatTime(matchingCurrentTime)}
                 </div>
             </div>
          </div>

          {/* Game Grid - Flex Grow to fill remaining space without scrolling */}
          <div className="flex-1 p-2 pb-safe w-full h-full">
             <div className={`grid h-full w-full gap-2 max-w-7xl mx-auto`}
                  style={{ 
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    // Auto rows to fill height
                  }}
             >
                {matchingCards.map(card => {
                  const isSelected = selectedCards.some(c => c.id === card.id);
                  return (
                    <button
                      key={card.id}
                      disabled={card.isMatched}
                      onClick={() => handleCardClick(card, selectedCards, setSelectedCards, matchingCards, setMatchingCards, setMatchedPairs)}
                      className={`
                        w-full h-full rounded-xl flex flex-col items-center justify-center text-center shadow-md transition-all duration-200 relative overflow-hidden p-1
                        ${card.isMatched ? 'bg-green-100 opacity-40 scale-95 border-2 border-green-300' : 
                          isSelected ? 'bg-blue-100 border-4 border-blue-400 scale-[1.02] z-10 shadow-xl' : 'bg-white hover:bg-gray-50 border-2 border-gray-200'}
                      `}
                    >
                      <div className={`font-bold w-full h-full flex items-center justify-center
                        ${card.type === 'EN' ? 'text-lg sm:text-2xl text-blue-800' : 'text-base sm:text-xl text-gray-800'}
                      `}>
                        <span className="whitespace-pre-wrap leading-tight">{card.content}</span>
                      </div>
                    </button>
                  );
                })}
             </div>
          </div>
       </div>
     );
  }

  // --- Mode 2: Multiplayer Result ---
  if (gameState === GameState.MATCHING_SINGLE_RESULT) {
    return (
      <div className="h-[100svh] w-full flex flex-col items-center justify-center p-4 bg-green-50">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full animate-bounce-custom border-8 border-green-200">
           <div className="text-6xl mb-6">🏁</div>
           
           <div className="mb-8">
             <div className="text-gray-500 text-sm uppercase tracking-widest mb-1">Challenger</div>
             <div className="text-4xl font-black text-blue-900 break-words leading-tight">{currentChallengerName}</div>
           </div>

           <div className="mb-8 bg-black/5 rounded-2xl p-4">
             <div className="text-gray-500 text-sm uppercase tracking-widest mb-1">Time</div>
             <div className="text-6xl font-mono text-green-600 font-bold">{formatTime(matchingCurrentTime)}</div>
           </div>
           
           <button 
             onClick={() => {
                 setCurrentChallengerName("");
                 setGameState(GameState.MATCHING_SINGLE_PLAYER_ENTRY);
             }}
             className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl text-xl hover:bg-blue-600 shadow-lg"
           >
             下一位挑戰者
           </button>
           
           <button 
             onClick={() => setGameState(GameState.MATCHING_MENU)} 
             className="mt-4 text-gray-500 font-bold hover:text-gray-700"
           >
             結束挑戰
           </button>
        </div>
      </div>
    );
  }

  // --- Mode 2: Matching - Dual Player Setup ---
  if (gameState === GameState.MATCHING_DUAL_SETUP) {
    return (
      <div className="h-[100svh] w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-100 to-orange-100">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg text-center">
           <h2 className="text-3xl font-bold mb-6 text-red-900">雙人對戰設定</h2>
           <label className="block text-lg font-bold text-gray-700 mb-4">對戰題數</label>
            <div className="flex justify-center gap-2 mb-2 flex-wrap">
               <button onClick={() => setQuestionCount(9)} className={`px-4 py-2 rounded-lg border-2 font-bold ${questionCount === 9 ? 'bg-red-500 text-white border-red-500 shadow-md ring-2 ring-red-300' : 'bg-white text-gray-600 border-gray-200'}`}>9題 (18張)</button>
               <button onClick={() => setQuestionCount(12)} className={`px-4 py-2 rounded-lg border-2 font-bold ${questionCount === 12 ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200'}`}>12題</button>
            </div>
             <p className="text-sm text-gray-500 mb-8">建議選擇 "9題" 以獲得最佳全螢幕體驗</p>
            
            <button 
              onClick={() => startDualMatching(questionCount)}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl text-xl hover:bg-red-700 shadow-lg"
            >
              FIGHT!
            </button>
            <button onClick={() => setGameState(GameState.MATCHING_MENU)} className="mt-4 text-gray-500 underline">取消</button>
        </div>
      </div>
    );
  }

  // --- Mode 2: Matching - Dual Playing ---
  if (gameState === GameState.MATCHING_DUAL_PLAYING) {
    return (
      <div className="h-[100svh] w-full flex bg-gray-900 overflow-hidden relative">
        
        {/* Abort Button (Centered Top) */}
        <button 
           onClick={handleAbortGame}
           className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl backdrop-blur-sm z-[70] transition-all border border-white/30"
        >
           ✕
        </button>
        {showQuitConfirm && <QuitModal onConfirm={confirmAbort} onCancel={() => setShowQuitConfirm(false)} />}


        {/* --- Player 1 (Left) --- */}
        <div className={`w-1/2 h-full flex flex-col border-r-4 border-black relative transition-all duration-500 ${dualWinner === 'P2' ? 'bg-black' : 'bg-blue-50'}`}>
           {dualWinner === 'P2' && (
             <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
               <span className="text-gray-700 font-bold text-4xl">DEFEAT</span>
             </div>
           )}
           {dualWinner === 'P1' && (
             <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="text-[8rem] animate-bounce filter drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">👑</div>
             </div>
           )}
           
           <div className="bg-blue-600 text-white text-center py-2 font-bold text-xl shadow-md flex-shrink-0">Player 1</div>
           <div className="flex-1 p-2 h-full w-full">
              <div className="grid h-full w-full gap-2" 
                   style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}> 
                   {/* 3 columns usually works best for split screen vertical */}
                {dualP1Cards.map(card => {
                   const isSelected = dualP1Selected.some(c => c.id === card.id);
                   return (
                     <button
                       key={card.id}
                       disabled={card.isMatched || !!dualWinner}
                       onClick={() => handleCardClick(card, dualP1Selected, setDualP1Selected, dualP1Cards, setDualP1Cards, setDualP1Matches)}
                       className={`
                         w-full h-full rounded-lg p-1 flex items-center justify-center text-center shadow-sm font-bold transition-all
                         ${card.isMatched ? 'invisible' : isSelected ? 'bg-blue-200 ring-2 ring-blue-500 scale-105' : 'bg-white text-gray-800'}
                       `}
                     >
                       <span className="whitespace-pre-wrap text-sm sm:text-base leading-tight">{card.content}</span>
                     </button>
                   );
                })}
              </div>
           </div>
        </div>

        {/* --- Player 2 (Right) --- */}
        <div className={`w-1/2 h-full flex flex-col relative transition-all duration-500 ${dualWinner === 'P1' ? 'bg-black' : 'bg-red-50'}`}>
           {dualWinner === 'P1' && (
             <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
               <span className="text-gray-700 font-bold text-4xl">DEFEAT</span>
             </div>
           )}
           {dualWinner === 'P2' && (
             <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="text-[8rem] animate-bounce filter drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">👑</div>
             </div>
           )}

           <div className="bg-red-600 text-white text-center py-2 font-bold text-xl shadow-md flex-shrink-0">Player 2</div>
           <div className="flex-1 p-2 h-full w-full">
              <div className="grid h-full w-full gap-2"
                   style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                {dualP2Cards.map(card => {
                   const isSelected = dualP2Selected.some(c => c.id === card.id);
                   return (
                     <button
                       key={card.id}
                       disabled={card.isMatched || !!dualWinner}
                       onClick={() => handleCardClick(card, dualP2Selected, setDualP2Selected, dualP2Cards, setDualP2Cards, setDualP2Matches)}
                       className={`
                         w-full h-full rounded-lg p-1 flex items-center justify-center text-center shadow-sm font-bold transition-all
                         ${card.isMatched ? 'invisible' : isSelected ? 'bg-red-200 ring-2 ring-red-500 scale-105' : 'bg-white text-gray-800'}
                       `}
                     >
                        <span className="whitespace-pre-wrap text-sm sm:text-base leading-tight">{card.content}</span>
                     </button>
                   );
                })}
              </div>
           </div>
        </div>
        
        {/* Back Button Overlay for Winner */}
        {dualWinner && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[60]">
             <button onClick={() => setGameState(GameState.MATCHING_MENU)} className="bg-white text-black font-bold px-8 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform">
               Back to Menu
             </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default App;