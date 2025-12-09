import { VocabularyItem, ExampleItem } from './types';

// Kept empty as we now embed definitions in the vocabulary list to support polysemy
export const englishDefinitions: Record<string, string> = {};
export const examples: Record<string, ExampleItem> = {};

export const vocabulary: VocabularyItem[] = [
  { 
    word: "abuse", 
    definition: "(n. [U]) 虐待", 
    images: ["🤕", "🛑", "💔", "⛓️"],
    englishDef: "cruel treatment of someone or something",
    example: {
      sentence: "Many organizations are working hard to stop animal abuse in the entertainment industry worldwide.",
      translation: "許多組織正致力於停止全球娛樂產業中的動物虐待行為。"
    }
  },
  { 
    word: "abuse", 
    definition: "(vt.) 虐待", 
    images: ["🤕", "🛑", "👋", "⛓️"],
    englishDef: "to treat someone badly or violently",
    example: {
      sentence: "It is illegal to abuse pets or farm animals in this country, according to new laws.",
      translation: "根據新法律，在這個國家虐待寵物或農場動物是非法的。"
    }
  },
  { 
    word: "highlight", 
    definition: "(n. [C]) 最精彩的部分", 
    images: ["⭐", "✨", "🏆", "🌟"],
    englishDef: "the best or most interesting part",
    example: {
      sentence: "The absolute highlight of our summer vacation was swimming with dolphins in the clear blue ocean.",
      translation: "我們暑假最精彩的部分是在清澈的藍色海洋中與海豚一起游泳。"
    }
  },
  { 
    word: "highlight", 
    definition: "(vt.) 強調", 
    images: ["🖊️", "🔦", "👀", "📝"],
    englishDef: "to make something easy to see or notice",
    example: {
      sentence: "The teacher used a red marker to highlight the spelling mistakes in the student's essay.",
      translation: "老師用紅筆標出學生作文中的拼寫錯誤。"
    }
  },
  { 
    word: "economy", 
    definition: "(n. [C]) 經濟", 
    images: ["💰", "📉", "🏭", "📊"],
    englishDef: "how a country makes and uses money",
    example: {
      sentence: "The global economy has suffered greatly due to the recent pandemic and political instability.",
      translation: "由於最近的流行病和政治不穩定，全球經濟遭受了巨大損失。"
    }
  },
  { 
    word: "economic", 
    definition: "(adj.) 經濟上的；經濟學的", 
    images: ["💰", "📉", "📈", "💵"],
    englishDef: "about trade, industry, or money",
    example: {
      sentence: "The government introduced new policies to encourage economic growth and create more jobs for young people.",
      translation: "政府推出了新政策以鼓勵經濟增長並為年輕人創造更多就業機會。"
    }
  },
  { 
    word: "economical", 
    definition: "(adj.) 節約的；經濟實惠的", 
    images: ["🐷", "🪙", "🏷️", "✅"],
    englishDef: "using money or time carefully",
    example: {
      sentence: "Riding a bicycle is an economical way to travel around the city because it saves fuel.",
      translation: "騎自行車是在城市中旅行的一種經濟實惠的方式，因為它節省燃料。"
    }
  },
  { 
    word: "demand", 
    definition: "(n. [U]) 需求；要求", 
    images: ["🗣️", "🤲", "📋", "❗"],
    englishDef: "a strong need or ask for something",
    example: {
      sentence: "There is a high demand for skilled engineers in the technology sector right now.",
      translation: "目前科技行業對熟練工程師的需求很高。"
    }
  },
  { 
    word: "demand", 
    definition: "(vt.) 要求", 
    images: ["🗣️", "😠", "👇", "❗"],
    englishDef: "to ask for something strongly",
    example: {
      sentence: "The workers decided to demand better wages and safer working conditions from the factory owner.",
      translation: "工人們決定向工廠老闆要求更好的工資和更安全的工作條件。"
    }
  },
  { 
    word: "illegally", 
    definition: "(adv.) 非法地", 
    images: ["🚫", "👮", "🚓", "⚖️"],
    englishDef: "in a way not allowed by law",
    example: {
      sentence: "The man was arrested because he illegally parked his car in front of the fire station.",
      translation: "這名男子因非法將車停在消防局前而被捕。"
    }
  },
  { 
    word: "illegal", 
    definition: "(adj.) 非法的", 
    images: ["🚫", "👮", "🛑", "⚖️"],
    englishDef: "not allowed by law",
    example: {
      sentence: "It is illegal to drive a car without a valid license and insurance in most countries.",
      translation: "在大多數國家，無照駕駛或沒有保險駕駛是非法的。"
    }
  },
  { 
    word: "legal", 
    definition: "(adj.) 合法的", 
    images: ["✅", "⚖️", "📜", "🆗"],
    englishDef: "allowed by law",
    example: {
      sentence: "The company ensures that all its business practices are completely legal and transparent to the public.",
      translation: "該公司確保其所有商業行為完全合法並對公眾透明。"
    }
  },
  { 
    word: "legal", 
    definition: "(adj.) 法律的", 
    images: ["⚖️", "👨‍⚖️", "📜", "🏛️"],
    englishDef: "connected to the law",
    example: {
      sentence: "You should seek legal advice from a lawyer before signing any important contracts or agreements.",
      translation: "在簽署任何重要合約或協議之前，您應該尋求律師的法律建議。"
    }
  },
  { 
    word: "lure", 
    definition: "(vt.) 引誘", 
    images: ["🎣", "🪤", "🍬", "👉"],
    englishDef: "to attract someone to go somewhere",
    example: {
      sentence: "The store tried to lure customers inside with a promise of huge discounts and free gifts.",
      translation: "這家商店試圖通過承諾巨額折扣和免費禮物來引誘顧客進店。"
    }
  },
  { 
    word: "lure", 
    definition: "(n. [usually sing.]) 誘惑；吸引力", 
    images: ["✨", "🧲", "🎣", "💫"],
    englishDef: "the power to attract or interest",
    example: {
      sentence: "The lure of fame and fortune attracts many young people to move to Hollywood every year.",
      translation: "名利雙收的誘惑每年吸引許多年輕人搬到好萊塢。"
    }
  },
  { 
    word: "herd", 
    definition: "(n. [C]) 獸群", 
    images: ["🐘", "🐄", "🐑", "🦓"],
    englishDef: "a large group of animals together",
    example: {
      sentence: "A large herd of elephants was seen drinking water at the river during the dry season.",
      translation: "旱季期間，人們看到一大群大象在河邊喝水。"
    }
  },
  { 
    word: "brutal", 
    definition: "(adj.) 殘暴的", 
    images: ["🩸", "🧛", "🔨", "🌪️"],
    englishDef: "very cruel and violent",
    example: {
      sentence: "The brutal winter storm destroyed many houses and left thousands of people without electricity for days.",
      translation: "殘酷的冬季風暴摧毀了許多房屋，使數千人幾天沒有電。"
    }
  },
  { 
    word: "operator", 
    definition: "(n. [C]) 經營者", 
    images: ["👨‍💼", "🏭", "🚜", "🏗️"],
    englishDef: "a person or company that runs a business",
    example: {
      sentence: "The tour operator arranged everything for our trip, including flights, hotels, and guided tours.",
      translation: "旅遊經營者為我們的旅行安排了一切，包括航班、酒店和導遊。"
    }
  },
  { 
    word: "operate", 
    definition: "(vi.) 經營；營運", 
    images: ["💼", "🏭", "🔛", "⚙️"],
    englishDef: "to work or run a business",
    example: {
      sentence: "The new restaurant will operate seven days a week to serve breakfast, lunch, and dinner.",
      translation: "新餐廳將每週營業七天，供應早餐、午餐和晚餐。"
    }
  },
  { 
    word: "operation", 
    definition: "(n. [C]) 營運；業務", 
    images: ["⚙️", "📈", "🏭", "📊"],
    englishDef: "a business activity or action",
    example: {
      sentence: "The rescue operation was successful, and all the hikers were brought back to safety immediately.",
      translation: "救援行動成功，所有登山者都立即被帶回安全地帶。"
    }
  },
  { 
    word: "mercilessly", 
    definition: "(adv.) 冷酷無情地；殘忍地", 
    images: ["❄️", "😈", "🔥", "🗡️"],
    englishDef: "without any kindness",
    example: {
      sentence: "The sun beat down mercilessly on the travelers as they crossed the hot, dry desert.",
      translation: "當旅行者穿越炎熱乾燥的沙漠時，太陽無情地照射著他們。"
    }
  },
  { 
    word: "merciless", 
    definition: "(adj.) 冷酷無情的；殘忍的", 
    images: ["😈", "❄️", "🗡️", "😠"],
    englishDef: "having no kindness; cruel",
    example: {
      sentence: "The merciless dictator ruled the country with fear and allowed no freedom of speech.",
      translation: "冷酷無情的獨裁者用恐懼統治國家，不允許言論自由。"
    }
  },
  { 
    word: "mercy", 
    definition: "(n. [U]) 仁慈；慈悲", 
    images: ["🕊️", "🤝", "🙏", "❤️"],
    englishDef: "kindness or forgiveness shown to someone",
    example: {
      sentence: "The king showed mercy to the prisoner and allowed him to return to his family.",
      translation: "國王對囚犯表現出仁慈，允許他回到家人身邊。"
    }
  },
  { 
    word: "strike", 
    definition: "(vt.) 打；擊", 
    images: ["👊", "⚡", "🏏", "🔨"],
    englishDef: "to hit someone or something hard",
    example: {
      sentence: "Lightning can strike the same place twice, contrary to the popular belief held by many people.",
      translation: "與許多人普遍的看法相反，閃電可以擊中同一個地方兩次。"
    }
  },
  { 
    word: "strike", 
    definition: "(n. [U]) 罷工", 
    images: ["🪧", "🛑", "✊", "🚧"],
    englishDef: "stopping work to protest",
    example: {
      sentence: "The railway strike caused major delays for commuters traveling to work in the city center.",
      translation: "鐵路罷工導致前往市中心上班的通勤者嚴重延誤。"
    }
  },
  { 
    word: "commit", 
    definition: "(vt.) 做出(錯事)；犯(罪)", 
    images: ["👮", "🚫", "⚖️", "🤥"],
    englishDef: "to do something wrong or illegal",
    example: {
      sentence: "He did not commit the crime, but he was still arrested by the police by mistake.",
      translation: "他沒有犯罪，但他還是被警察誤捕了。"
    }
  },
  { 
    word: "commit", 
    definition: "(vt.) 承諾；保證", 
    images: ["💍", "🤝", "🔐", "🫡"],
    englishDef: "to promise to do something",
    example: {
      sentence: "She decided to commit herself to learning French for two hours every single day this year.",
      translation: "她決定今年每天花兩個小時致力於學習法語。"
    }
  },
  { 
    word: "commitment", 
    definition: "(n. [C]) 承諾；保證", 
    images: ["💍", "🤝", "🔐", "📜"],
    englishDef: "a promise to do something",
    example: {
      sentence: "Marriage is a lifelong commitment that requires love, patience, and understanding from both partners involved.",
      translation: "婚姻是一生的承諾，需要雙方付出愛、耐心和理解。"
    }
  },
  { 
    word: "obedient", 
    definition: "(adj.) 服從的；順從的", 
    images: ["🐕", "🫡", "👂", "✅"],
    englishDef: "doing what you are told",
    example: {
      sentence: "The obedient dog sat down immediately when his owner gave the command to stay still.",
      translation: "當主人發出保持不動的命令時，這隻聽話的狗立刻坐下了。"
    }
  },
  { 
    word: "obedience", 
    definition: "(n. [U]) 服從", 
    images: ["🫡", "🐕", "🧎", "✅"],
    englishDef: "the act of doing what you are told",
    example: {
      sentence: "Soldiers are expected to show absolute obedience to their commanding officers during military training exercises.",
      translation: "士兵在軍事訓練演習期間被期望對其指揮官表現出絕對的服從。"
    }
  },
  { 
    word: "tame", 
    definition: "(vt.) 馴服", 
    images: ["🎪", "🦁", "🐎", "🤝"],
    englishDef: "to make a wild animal gentle",
    example: {
      sentence: "It takes a lot of patience and skill to tame a wild horse for riding safely.",
      translation: "馴服一匹野馬以安全騎乘需要很大的耐心和技巧。"
    }
  },
  { 
    word: "tame", 
    definition: "(adj.) 馴服的", 
    images: ["🐈", "🐕", "🐑", "🏡"],
    englishDef: "not wild; gentle and safe",
    example: {
      sentence: "The lions in the circus seemed tame, but they are still wild animals at heart.",
      translation: "馬戲團裡的獅子看起來很馴服，但牠們內心仍然是野生動物。"
    }
  },
  { 
    word: "vulnerable", 
    definition: "(adj.) 脆弱的；容易受傷害的", 
    images: ["🐣", "🛡️", "🤕", "❄️"],
    englishDef: "easy to hurt or attack",
    example: {
      sentence: "Small children and elderly people are often the most vulnerable members of our society during disasters.",
      translation: "在災難期間，幼兒和老年人通常是我們社會中最脆弱的成員。"
    }
  },
  { 
    word: "permanent", 
    definition: "(adj.) 永久的", 
    images: ["♾️", "🖊️", "🗿", "🏰"],
    englishDef: "lasting forever or for a long time",
    example: {
      sentence: "Smoking can cause permanent damage to your lungs that cannot be fixed by medicine later.",
      translation: "吸煙會對你的肺部造成永久性損害，以後無法通過藥物修復。"
    }
  },
  { 
    word: "adequate", 
    definition: "(adj.) 充足的；足夠的", 
    images: ["🥛", "🍞", "✅", "👌"],
    englishDef: "enough for what is needed",
    example: {
      sentence: "We need to ensure there is adequate water supply for everyone during the long dry summer.",
      translation: "我們需要確保在漫長乾燥的夏天為每個人提供充足的供水。"
    }
  },
  { 
    word: "exhaustion", 
    definition: "(n. [U]) 筋疲力盡", 
    images: ["😫", "🔋", "🛌", "💤"],
    englishDef: "being very, very tired",
    example: {
      sentence: "The marathon runner collapsed from exhaustion right after crossing the finish line of the race.",
      translation: "馬拉松跑者在越過比賽終點線後因筋疲力盡而倒下。"
    }
  },
  { 
    word: "exhaust", 
    definition: "(vt.) 使筋疲力盡", 
    images: ["😫", "🥵", "🏃", "🏋️"],
    englishDef: "to make someone very tired",
    example: {
      sentence: "Looking after three active young children all day can completely exhaust even the most energetic parents.",
      translation: "整天照顧三個活潑的幼兒即使是精力最充沛的父母也會筋疲力盡。"
    }
  },
  { 
    word: "complex", 
    definition: "(adj.) 複雜的", 
    images: ["🧩", "🕸️", "🧠", "🏗️"],
    englishDef: "having many parts; difficult to understand",
    example: {
      sentence: "The human brain is a complex organ that controls every thought, feeling, and movement we have.",
      translation: "人腦是一個複雜的器官，控制著我們的每一個思想、感覺和動作。"
    }
  },
  { 
    word: "intelligent", 
    definition: "(adj.) 聰明的；有才智的", 
    images: ["🧠", "💡", "🎓", "🐬"],
    englishDef: "able to learn and understand well",
    example: {
      sentence: "Dolphins are highly intelligent creatures that can communicate with each other using a variety of sounds.",
      translation: "海豚是高度聰明的生物，可以使用各種聲音相互交流。"
    }
  },
  { 
    word: "intelligence", 
    definition: "(n. [U]) 智力；才智", 
    images: ["🧠", "🤖", "📈", "💡"],
    englishDef: "the ability to learn and understand",
    example: {
      sentence: "Artificial intelligence is changing the way we live and work in the modern digital world.",
      translation: "人工智慧正在改變我們在現代數位世界中的生活和工作方式。"
    }
  }
];