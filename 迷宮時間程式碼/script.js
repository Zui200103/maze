// 遊戲配置
const config = {
    initialZoom: 1,
    minZoom: 0.1,
    maxZoom: 50,
    targetRadius: 2,
    trailOpacity: 0.5,
    zoomSpeed: 0.1
};

// 遊戲狀態
const gameState = {
    isInitialized: false,
    isLoading: true,
    error: null
};

const objects = [
    { x: 150, y: 100, width: 50, height: 50, text: "物件1" },
    { x: 300, y: 200, width: 50, height: 50, text: "物件2" },
    { x: 450, y: 300, width: 50, height: 50, text: "物件3" }
  ];

  function drawObjects(ctx, zoomFactor, offsetX, offsetY) {
    objects.forEach(obj => {
      // 計算縮放後的坐標與大小
      const scaledX = obj.x * zoomFactor + offsetX;
      const scaledY = obj.y * zoomFactor + offsetY;
      const scaledWidth = obj.width * zoomFactor;
      const scaledHeight = obj.height * zoomFactor;
  
      // 繪製物件
      ctx.fillStyle = "blue";
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
  
      // 繪製文字
      ctx.fillStyle = "white";
      ctx.font = `${12 * zoomFactor}px Arial`;
      ctx.fillText(obj.text, scaledX + 5, scaledY + 15);
    });
  }

class MazeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.initializeCanvas();
        
        // 遊戲狀態
        this.zoomFactor = config.initialZoom;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        // 原有的建構函式內容
        // 加入新的變數追蹤上一個有效的滑鼠位置
        this.lastValidMouseX = null;
        this.lastValidMouseY = null;
        
        // 目標物件
        this.target = {
            x: 70,
            y: 1130,
            radius: config.targetRadius,
            color: 'red',
            borderColor: 'blue',
            following: false,
            trail: []
        };

        // 添加地點物件
        this.locations1 = [
           
            { 
                x: 738, 
                y: 25, 
                width: 54, 
                height: 21, 
                text: "神武門", 
                description: "紫禁城的四座大門分別為：正門是午門，東門叫東華門，西門叫西華門，北門名玄武門。按照風水中的四象學中的左青龍，右白虎，前朱雀，後玄武，玄武主北方，所以帝王宮殿的北宮門多取名「玄武」。清康熙年間因避諱其名字玄燁改稱「神武門」，其在形制上比午門低一個等級。它是宮內日常出入的門禁。",
                color: "rgba(255, 165, 0, 1)"
            },
            { 
                x: 711, 
                y: 1260, 
                width: 90, 
                height: 38, 
                text: "午門", 
                description: "明代午門與天安門之間的廊廡全部是黃瓦，皇城禦道全部是漢白玉的；在清代午門與天安門之間的廊廡被改成灰瓦，皇城禦道更換成青石板。這是一大變化。明代的午門，兩邊的燕翅樓是籙頂的，而不是現代的攥尖頂。而且午門外的朝房也是黃瓦，中間禦道是漢白玉的，不是現在的青石板。且在明朝紫禁城正門午門前有6座石製大象雕塑，但是到了清朝時期，這六尊大象雕塑已經被損毀，看不到了。皇城的正門是皇宮的「皋門」，是宣召的地方，就像大明宮宣召在丹鳳門，北京皇宮宣召在承天門。",
                color: "rgba(255, 165, 0, 1)"
            },{ 
                x: 335, 
                y: 1026, 
                width: 48, 
                height: 15, 
                text: "武英殿", 
                description: "武英殿是一組建於明代永樂年間的宮殿建築，位於北京故宮外朝熙和門以西，正殿武英殿南向，面闊5間，進深3間，黃琉璃瓦歇山頂。須彌座圍以漢白玉石欄，前出月台，有甬路直通武英門。在明朝初期帝王齋居、召見大臣這些隆重的活動都是集中在武英殿的，崇禎年間皇后千秋、命婦朝賀儀也在此舉行，足見其在明朝的地位。",
                color: "rgba(255, 165, 0, 1)"
            },{ 
                x: 1057, 
                y: 1028, 
                width: 48, 
                height: 15, 
                text: "文華殿", 
                description: "文華殿起初是皇帝常禦之便殿，明朝天順朝、成化朝，太子踐祚以前，首先攝事於文華殿。後來由於眾太子多少，無法參與政事，嘉靖十五年（1536年）將文華殿仍改為皇帝便殿，後來作為每年春秋仲月的經筵之所，文華殿建築隨之由綠琉璃瓦頂改為黃琉璃瓦頂。",
                color: "rgba(255, 165, 0, 1)"
            },{ 
                x: 1169, 
                y: 650, 
                width: 161, 
                height: 92, 
                text: "南三所", 
                description: "明朝這一帶有端敬殿、端本宮，為東宮太子所居。清乾隆十一年（1746年）在原有遺址上興建三所院落，因其位於寧壽宮以南，故又稱「南三所」，也稱「阿哥所」或「所兒」，嘉慶朝以後多以「麋芳殿」代稱整組建築。南三所共用一座宮門，門內有一東西窄長的小廣場，廣場北側自東向西依序排列3所，每所皆為前後3進，形製完全相同。整個南三間共有房200餘間。南三所位在紫禁城東部，按陰陽五行之說，東方屬木，青色，主生長，故屋頂多覆綠琉璃瓦，並安排皇子在此居住。",
                color: "rgba(255, 165, 0, 0.5)"
            },{ 
                x: 733, 
                y: 380, 
                width: 51, 
                height: 15, 
                text: "乾清宮", 
                description: "乾清宮建築規模為內廷之首，採用黃琉璃瓦重檐五殿頂，座落於單層漢白玉玉石臺基上。乾清宮面闊9間，進深5間，高20米，建築結構為減柱造行形式，以擴大室內空間，設有寶座。明朝的十四個皇帝和清代的順治、康熙兩個皇帝，都以乾清宮為寢宮（自雍正始移居養心殿）。",
                color: "rgba(255, 165, 0, 1)"
            },{ 
                x: 498, 
                y: 413, 
                width: 137, 
                height: 88, 
                text: "養心殿", 
                description: "養心殿位於紫禁城內廷西南方，從雍正開始，近二百年來歷代清帝均以此為休息及辦公的地方，因此，養心殿可說是紫禁城的心臟，是支配著大清王朝興衰、詔書發布的重要場所。雍正即位以後，養心殿成為皇帝日常辦公就寢之地，在此批章閱本，召對引見，宣諭籌策漸成為慣例，因而此後清的各代皇帝均以此地做為主要辦公的地方，如晚清時的慈禧太后即在養心殿垂簾聽政，而末代皇帝溥儀宣布退位的詔書，亦是從養心殿發出來的。",
                color: "rgba(255, 165, 0, 0.5)"
            },{ 
                x: 1222, 
                y: 388, 
                width: 88, 
                height: 106, 
                text: "寧壽宮", 
                description: "寧壽宮，又稱為乾隆花園，位處紫禁城東北角、寧壽宮區左側長方形的小片區，為一七七一年乾隆親自下旨改建成太上皇宮。但終其一生，乾隆並未有機會在此久住，而這處園林隨後便在他諭令下保持一切規制、不得改建，之後歷任清帝都遵循祖訓，僅將寧壽宮做為宴會祭典場所使用。",
                color: "rgba(255, 165, 0, 0.5)"
            },{ 
                x: 639, 
                y: 150, 
                width: 242, 
                height: 103, 
                text: "御花園", 
                description: "御花園，位於紫禁城中軸線上，是一座微型的皇宮後廷花園。這裡設有花石小徑、假山、池塘、古林。御花園設在皇宮中路的末端，很有意味。領略了皇宮中路一座座高大巍峨的宮殿莊嚴肅穆的感覺之後，來到御花園，會體會皇宮溫和婉約的一面。御花園原來是皇帝及后妃憩賞的園林，也兼具頤養、祭祀、讀書、藏書等功能。御花園的主體建築欽安殿是重簷盝頂式建築，處在紫禁城中軸線上，以欽安殿為中心，向南側東、西兩側佈置亭台樓閣。禦花園內的竹、柏、松之間點綴山石，形成了四季長青的景觀。",
                color: "rgba(255, 165, 0, 0.5)"
            },{ 
                x: 727, 
                y: 1118, 
                width: 70, 
                height: 30, 
                text: "內金水橋", 
                description: "內金水橋位於今北京故宮內太和門前廣場的內金水河上，為五座並列單孔拱券式漢白玉石橋。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 733, 
                y: 672, 
                width: 50, 
                height: 36, 
                text: "中和殿", 
                description: "中和殿是北京紫禁城外朝三大殿之一，位於太和殿與保和殿之間。始建於明永樂十八年（1420年），當時稱「華蓋殿」，後因明嘉靖年間火災重修，改稱「中極殿」，至清順治二年（1645年）才定名為「中和殿」，其中「中和」二字取自《禮記·中庸》中的語句，象徵著天下的根本和道理。中和殿的主要功能是皇帝在前往太和殿參加大典之前的小憩和接受朝拜，並且在祭祀儀式前閱視祭文、祝版和農具，皇太后上徽號時也在此進行。此外，清朝每七年纂修一次的玉牒會在此呈交給皇帝，並舉行隆重的儀式。辛亥革命後，當清遜帝溥儀仍居後宮時，袁世凱意圖稱帝，對三大殿進行裝潢改動，其中中和殿的匾額進行了漢文和滿文的調整。中和殿的建築設計簡潔且充滿象徵性，面積為580平方米，是三大殿中最小的。它的結構為單檐四角攢尖頂，屋面覆有黃色琉璃瓦，中央設有銅胎鎏金寶頂。殿內設有寶座，寶座上方懸掛著乾隆帝御題的匾額「允執厥中」，並有乾隆帝所題對聯，寓意著帝王應保持中正，萬事應遵循天道。中和殿的門窗設計獨特，取材於《大戴禮記》中的「明堂」，避免與其他殿門窗雷同。殿前的排水口設計為龍頭形狀，下雨時會形成「千龍吐水」的景觀，增添了紫禁城的宏偉與神秘感。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 726, 
                y: 609, 
                width: 61, 
                height: 23, 
                text: "保和殿", 
                description: "保和殿是北京故宮外朝三大殿之一，位於中和殿以北，是故宮少數至今仍保留明代原形的建築之一。建於明朝永樂十八年（1420年），最初名為「謹身殿」，經過數次更名，最終在清朝順治二年（1645年）改為「保和殿」，意指「志不外馳，恬神守志」，強調專注與和諧。保和殿的歷史經過了多次變遷。在明朝時，保和殿主要用於皇帝更衣以及其他重大儀式前的準備。到了清朝，每年除夕和正月十五，皇帝會在此舉行宴會，賜宴外藩、王公及高官。順治帝和康熙帝曾經在此居住過，並且為他們的暫時居住設立了專門的名稱。乾隆帝開始將保和殿用作科舉的殿試場所，每科殿試的錄取者會被召集到此地進行重要的考試。辛亥革命後，清朝的末代皇帝溥儀仍居後宮，而袁世凱曾經對這三大殿進行裝修，使其略有改動。保和殿的建築在明代的基礎上進行了改造，采用「減柱造」的特殊法式，減少了殿內前檐的六根金柱，增大了空間。整體結構采用重檐歇山頂，上覆黃色琉璃瓦。殿內外均飾以金龍和璽彩畫，並採用瀝粉貼金的龍形天花。保和殿內的寶座上方懸掛乾隆帝的御題匾額「皇建有極」，強調建立天下最高準則。此外，殿前設有雕刻精美的雲龍石雕，被稱為「雲龍石雕」，是由京西房山的大石窩提供石料，並需要超過萬名工人花費一個月的時間才能完成。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 720, 
                y: 1028, 
                width: 80, 
                height: 17, 
                text: "太和門", 
                description: "太和門是故宮外朝三大殿的正南門，也是紫禁城內最大的宮門及正門，是自天安門南側向北進紫禁城時經過的第四道門（前三道依次為天安門、端門、午門）。太和門建成於明朝永樂十八年（1420年），初稱「奉天門」。明朝嘉靖三十七年六月辛卯重建改稱「大朝門」，嘉靖四十一年（1562年）改稱「皇極門」。清朝順治二年（1645年），改易宮殿名號，門隨大殿改稱為「太和門」。太和門是宮廷最高大的門座。由紫禁城正南的午門進來，首先看到的便是這座大門。太和門兩側各設旁門一座，與太和門平排並列，左邊的叫昭德門，右邊的叫貞度門。於明朝永樂十八年（1420年）建成，初稱「東角門」及「西角門」，嘉靖四十一年（1562年）改為「弘政門」及「宣治門」。現在的名號是在清朝順治二年（1645年）改稱的。明朝時，左邊昭德門為考選鴻臚之地。清朝兩門皆為侍衛值宿處。左右門體量比較矮小，屬於陪襯性的建築物。明朝時，太和門是「禦門聽政」之處，皇帝在太和門接受臣下朝拜及上奏，頒佈詔令，處理政事。清朝初年，皇帝也曾在太和門聽政、賜宴，後來「禦門聽政」改在乾清門進行。清朝順治元年九月（1644年），清朝統治者定鼎北京之後，首位皇帝順治帝在太和門頒佈大赦令。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 1064, 
                y: 1082, 
                width: 43, 
                height: 15, 
                text: "文華門", 
                description: "位於文華殿建築群最南端。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 1052, 
                y: 996, 
                width: 60, 
                height: 15, 
                text: "主敬殿", 
                description: "文華殿後殿為主敬殿，規制和文華殿略似，但進深稍淺。文華殿與主敬殿之間有穿廊相連。主敬殿以北便是文淵閣前的方池。",
                color: "rgba(0, 200, 0, 0.5)"
            },{ 
                x: 1063, 
                y: 938, 
                width: 42, 
                height: 18, 
                text: "文淵閣", 
                description: "文淵閣（滿語：ᡧᡠ᠌ ᡨᡠ᠋ᠩᡤᡠ ᠠᠰᠠᡵᡳ，穆麟德轉寫：šu tunggu asari），位於紫禁城外朝東路、文華殿以北，是清朝皇宮藏書樓。「文淵閣」曾是明朝南京故宮、北京故宮及明中都鳳陽的皇家藏書樓名，庶吉士就學觀政之所。明朝北京文淵閣建於永樂年間，位於文華殿前、內承運庫之後，面對皇城，後來無存。清朝乾隆年間，在北京紫禁城東華門內的文華殿後，明朝聖濟殿舊址，新建了一座文淵閣，於乾隆四十一年（1776年）建成，用以收藏《四庫全書》。此書編纂自乾隆三十八年（1773年），歷經六年完成，正本分藏於文淵閣、文源閣、文津閣、文溯閣（合稱「北四閣」），及後來的文宗閣、文匯閣、文瀾閣（稱「南三閣」）。文淵閣作為皇家藏書樓，規模宏大，內部分層放置經、史、子、集四部分書籍，一層設皇帝寶座，三層設御榻以備皇帝閱覽。文淵閣仿浙江寧波天一閣建築風格，外觀為兩層樓，腰檐處設暗層，頂覆黑琉璃瓦，寓意防火。文淵閣前有方池及石橋，後有假山屏障，整體建築布局精巧。清廷規定，官員經允許可入內閱覽書籍，但不得損壞或攜出。1932年，梁思成與劉敦楨曾維修文淵閣，2013年起對外開放，但僅供外觀參觀。文淵閣屬翰林院體系，乾隆年間設官制管理，設領閣事、直閣事、校理等職位，負責書籍管理及檢曝。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 1146, 
                y: 1031, 
                width: 32, 
                height: 13, 
                text: "傳心殿", 
                description: "傳心殿位於紫禁城東南隅的文華殿東側，是清朝皇帝在御經筵前舉行「祭告禮」的場所。創建於康熙年間，「經筵」是為皇帝研習經史而設的講席，通常於每年春秋兩季舉行，遇酷暑或嚴寒則暫停。傳心殿為一組祭祀性建築，院落南北長100米，東西寬25米，占地2500平方米。院內自南向北依次設有治牲所、景行門、傳心殿等建築。治牲所位於最南端，坐南朝北，面闊五間，頂覆黃琉璃瓦。景行門居中，面闊三間，明間前後檐開門，旁有「大庖井」，井水清洌，與玉泉山水齊名。傳心殿為主建築，位於景行門北，面闊五間，殿內中央供奉伏羲、神農等歷代賢師塑像，東設周公位，西設孔子位。殿後建有祝版房、神廚及值房，分別面闊三至五間，為祭禮及日常管理所用。整座建築布局嚴謹，是清代皇帝祭祀及文化傳承的重要場所。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 981, 
                y: 1183, 
                width: 105, 
                height: 68, 
                text: "內閣大堂", 
                description: "內閣大堂位於紫禁城太和門東廡外東南，是清朝大學士直舍，又稱「大學士堂」。1990年代，中國紫禁城學會成立後，內閣大堂成為其會址。內閣大堂的主要建築包括：內閣大堂本體，坐北朝南，面闊三間，覆黃琉璃瓦，大堂前設有屏門四扇及垂花門，並以牆垣與東、西兩廂分隔。東西側各有耳房四間，東為滿票簽房，西為稽查房，均為灰瓦硬山頂。大堂後方為內閣大學士的齋宿區域，其東側設有滿票簽檔子房與典籍廳。其他附屬建築包括漢票簽房，位於內閣大堂東廂房，坐東朝西，面闊三間，為侍讀擬寫草簽、中書繕寫真簽及存放檔案之所；蒙古堂為西廂房，坐西朝東，面闊三間；漢本堂與滿本堂分別位於漢票簽房與蒙古堂南側，均面向紫禁城南城牆，面闊三間；祝版房位於滿本堂之西，是專門負責繕寫大祀祝版的場所。整體建築布局嚴謹，體現內閣辦公的重要地位與功能。",
                color: "rgba(0, 200, 0, 0.5)"
            },{ 
                x: 1096, 
                y: 1200, 
                width: 152, 
                height: 13, 
                text: "內閣大庫", 
                description: "內閣大庫位於紫禁城東南隅、內閣大堂以東，是內閣專門用於收貯文書與檔案的庫房。內閣大庫包括兩座建築，均為東西走向的排房，結構以磚石為主，牆面設窗，窗內有鐵柱，窗外加裝鐵板窗，具有較高的安全性。其中，西側建築為紅本庫，用於存放紅本、典籍、關防等文書；東側建築為實錄庫，用於存放書籍、三節表文、表匣、外藩表文等檔案。此外，內閣大庫還收存來自滿本堂的實錄、史書、錄疏、起居注，以及前代帝王功臣畫像等珍貴物品。目前，內閣大庫建築保存完好，展現出當年檔案保管的規模與嚴密性。",
                color: "rgba(0, 200, 0, 0.5)"
            },{ 
                x: 1010, 
                y: 653, 
                width: 50, 
                height: 15, 
                text: "箭亭", 
                description: "箭亭位於紫禁城東部景運門外、奉先殿以南的開闊平地上，是清朝皇帝及其子孫名義上用於練習騎馬射箭的場所。然而，清朝皇帝及其眷屬很少長時間居住於紫禁城，實際上皇子皇孫學習騎射的主要場所在圓明園山高水長樓旁的「西廠」或稱「西苑」。箭亭始建於清雍正八年（1730年），其建立旨在防止滿族因受漢化而導致祖制淹沒，乾隆帝和嘉慶帝均曾在此射箭與操演武藝。箭亭前為寬闊的平地，為皇子皇孫練習騎射及殿試武進士的閱技勇之地。箭亭四周亦為清初特許入東華門者下馬之地，為拴歇馬匹之處。箭亭為獨立大殿，坐北朝南，面闊五間，進深三間，黃琉璃瓦歇山頂，建築四面出廊，內有20根朱漆大柱承托梁架，山牆不開窗，南北設有八扇菱花槅扇門。殿內中央設寶座，東側立有乾隆十七年（1752年）上諭臥碣，內容提倡滿清貴族遵守舊制，勤於練習騎射，不效漢俗。嘉慶十三年（1808年），又立碑告誡子孫不忘祖制。箭亭至今保存完好，並於2016年隨紫禁城新增開放區域而向公眾開放，其南側現擺放著根據唐代《五牛圖》製作的銅雕五牛，作為文化展示的一部分。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 337, 
                y: 1090, 
                width: 40, 
                height: 12, 
                text: "武英門", 
                description: "面闊五間（30.4米），進深二間（11.7米），黃琉璃瓦單檐歇山頂，武英門以北有一條帶欄杆的甬路連接正殿武英殿。武英門東、西兩側各有值房（廊房），頂覆黃琉璃瓦。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 326, 
                y: 996, 
                width: 66, 
                height: 13, 
                text: "敬思殿", 
                description: "為後殿，面闊五間，進深三間，黃琉璃瓦單檐歇山頂，單翹單昂斗拱，形制與正殿相同，但進深稍淺。該殿與正殿同在一個「工」字形台基上。兩殿中間有三間的封閉的廊道相連，廊道為中華民國時期加建。",
                color: "rgba(0, 200, 0, 0.5)"
            },{ 
                x: 391, 
                y: 976, 
                width: 18, 
                height: 13, 
                text: "恆壽齋", 
                description: "位於武英殿建築群的東北角，頂覆黃琉璃瓦。清朝時，此處為繕校《四庫全書》諸臣值房。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 298, 
                y: 1008, 
                width: 18, 
                height: 13, 
                text: "浴德堂", 
                description: "浴德堂位於紫禁城武英殿院內西北平台上，緊鄰敬思殿西側，名稱取自《禮記·儒行》中「儒有澡身而浴德」之句，寓意修身養德，為清朝詞臣校書的值房，負責刊刻與裝潢圖書事宜。浴德堂坐北朝南，面闊三間，黃琉璃瓦卷棚歇山頂，後檐西側接抱廈兩間，堂後偏西有北房，面闊兩間，亦為黃琉璃瓦卷棚硬山頂。堂內東次間後檐設有門，通往一條磚砌拱券曲折通道，連接後室。後室平面呈方形，上覆穹頂，帶有阿拉伯式建築風格，內部以素白琉璃面磚裝飾，頂部設有圓窗，後牆建有鐵製壁爐用於燒水。後室外設有鍋台，旁有井亭，井水通過懸石槽引入鍋台，加熱產生蒸氣供應後室，具備浴室功能。據考證，該後室為元代宮城內遺存的土耳其浴室，相傳明朝時曾作為皇帝齋祓的場所，清朝時在武英殿設御書處後，改為蒸紙處，用於蒸熏印刷圖書所需的紙張。位於浴德堂西北、武英殿建築群西牆外最北端的井亭，頂覆黃琉璃瓦，是供應鍋台用水的重要設施。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 463, 
                y: 1070, 
                width: 50, 
                height: 20, 
                text: "斷虹橋", 
                description: "斷虹橋位於紫禁城熙和門外、武英殿以東，是一座極其精美的石拱橋，其名稱「斷虹」為俗稱，明清時期文獻中未見記載。該橋為單拱石券結構，南北向橫跨內金水河，全長18.7米，最寬處達9.20米。橋面鋪設漢白玉巨石，兩側石欄板雕刻穿花龍紋，望柱上飾有神態各異的石獅，工藝華麗精緻，是紫禁城內橋樑之冠。斷虹橋的建造年代眾說紛紜，有學者認為始建於明朝初年，也有觀點認為其起源於元朝。橋北一帶古槐成林，素有「十八棵槐」之稱，這片古樹群為紫禁城內特色景觀之一，據傳種植於元朝，現存槐樹雖不足十八棵，但其歷史風貌仍清晰可見。斷虹橋以北區域曾長期不對外開放，直至2016年9月29日，故宮博物院新開放該橋至慈寧宮的南北通道，觀眾可從斷虹橋向北經十八槐至故宮文化資產數位化應用研究所，該所設有VR演播廳供學生團體預約觀看故宮虛擬實境節目，並可繼續北行經故宮冰窖至慈寧宮與隆宗門間的小廣場，完整展現了這一區域的文化與景觀價值。",
                color: "rgba(0, 200, 0, 0.5)"
            },{ 
                x: 195, 
                y: 1024, 
                width: 54, 
                height: 59, 
                text: "寶蘊樓", 
                description: "寶蘊樓位於紫禁城西南，原為咸安宮的舊址，後來成為故宮博物院的院史館。咸安宮建於明朝嘉靖年間，曾是太子住處，清朝初年改建，並設有官學。後來，咸安宮改稱為壽安宮，成為皇太后的住所，並於乾隆時期修繕。1912年，咸安宮遭火災，並隨著古物陳列所的設立，改為寶蘊樓，作為文物收藏與展示的場所。1914年，隨著大量文物運至北京，寶蘊樓成為存放清朝及熱河行宮文物的重點倉庫，並至今保存大量歷代珍貴文物。",
                color: "rgba(0, 200, 0, 0.5)"
            },{ 
                x: 207, 
                y: 1169, 
                width: 77, 
                height: 27, 
                text: "南薰殿", 
                description: "南薰殿位於紫禁城外朝西路，武英殿西南，建於明朝，為安奉歷代帝后及賢臣圖像的場所，是故宮少數保留明代原形的建築之一。名稱來自《禮記·樂記》中的「南風」，寓意以南風熏陶。歷史上，南薰殿在唐代已有，並在南漢與明朝亦有相似建築。明朝時期，閣臣在此撰寫金寶金冊文，並在崇禎三年命武英殿畫歷代賢君圖，清朝乾隆時移至南薰殿。南薰殿為獨立院落，四周圍牆，建築為五間單檐歇山頂，內設朱紅漆木閣，安奉歷代帝王及皇后像。南薰殿的木構和彩畫均為明代遺物，並存有乾隆帝的臥碣。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 258, 
                y: 1206, 
                width: 250, 
                height: 41, 
                text: "南大庫", 
                description: "南大庫位於紫禁城西南角，原為燈庫、木庫和武器庫等多功能庫房區域，現僅保存燈庫。燈庫位於南薰殿東南側，原為儲存燈具的場所。這座廊房覆有黃琉璃瓦，在乾隆京城全圖中標註為「磁器庫」。在南大庫保護管理用房建成前，燈庫曾用作故宮武警總隊的食堂。2013年，故宮博物院啟動了南大庫保護管理用房建設工程，旨在改善武警駐守故宮的條件並騰退相關區域，以利古建築的保護。該工程占地7336平方米，計劃建築面積3966平方米，預計2015年完工。2014年，紫禁城內進行考古發掘，發現了與清朝相關的建築遺址及灰坑，出土大量御窯瓷器碎片，這些發現對研究清朝內務府的工藝生產提供了珍貴資料。",
                color: "rgba(0, 200, 0, 0.5)"
            },{ 
                x: 740, 
                y: 507, 
                width: 40, 
                height: 20, 
                text: "乾清門", 
                description: "乾清門是北京故宮內廷的正門，因乾清宮而得名，過此門便可見乾清宮。該門始建於明朝永樂十八年（1420年），清朝順治十二年（1655年）重修，是皇帝「御門聽政」的地方。順治帝首創在乾清門「御門聽政」的慣例，聽政時間通常為早上8點，奏事官員在門外跪奏，皇帝在門內作出「降旨」決定。康熙帝特別勤政，幾乎每日到此聽政，許多重大決策也在此作出；然而自雍正、乾隆以後，「避喧聽政」的時間增多，乾清門聽政次數逐漸減少，至咸豐帝時停止。乾清門也是齋戒和典禮的舉行地點。乾清門面闊5間，進深3間，建築高約16米，為單檐歇山頂設計，基座為高1.5米的漢白玉須彌座，周圍環繞雕石欄杆，門前有鎏金銅獅和御路石，整體裝飾金碧輝煌。乾清門廣場以北是內廷區域，以南是外朝區域，廣場東西側分別為景運門和隆宗門。門外兩側設有影壁和多功能廬房，分別用於大臣奏事和侍衛值班。2013年，故宮進行乾清門廣場地面翻墁工程，恢復歷史原貌，並向公眾展示傳統技藝。乾清門東側曾有星巴克分店，2007年因輿論爭議撤出，現改為故宮商店。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 568, 
                y: 522, 
                width: 70, 
                height: 18, 
                text: "軍機處", 
                description: "軍機處是清朝康熙、雍正年間創立的中央最高輔弼機構，標誌著君主專制的最高階段。始設於雍正七年（1729年），最初為臨時軍事指揮機構，處理西北用兵事務。後因準噶爾戰爭，擴展職責為常設機構，成為皇帝的秘書班子及參議機構，取代議政王大臣會議和廷議，鞏固皇權。軍機處設於隆宗門內，內部陳設簡樸，辦事效率高，保密制度嚴格。職掌包括起草諭旨、處理奏摺、參與重大政務和案件審議，並隨侍皇帝出巡等。軍機大臣為主要成員，另有軍機章京負責文書工作。此機構在清朝統治期間發揮重要作用，直至宣統三年（1911年）隨責任內閣成立而撤銷。",
                color: "rgba(0, 200, 0, 0.5)"
            },{ 
                x: 800, 
                y: 379, 
                width: 32, 
                height: 24, 
                text: "昭仁殿", 
                description: "昭仁殿位於北京故宮乾清宮東側，是一座具有深厚歷史背景的小殿，原名弘德殿，始建於明朝，萬曆十四年（1586年）更名為昭仁殿。明崇禎十七年，崇禎帝在昭仁殿砍殺昭仁公主後赴景山自縊，為明朝覆亡的重要歷史場景之一。清朝時，昭仁殿成為皇帝讀書與藏書之地，乾隆帝在此建立「天祿琳琅」藏書系統，精選善本並編撰書目。然而嘉慶二年（1797年）的火災燒毀大部分藏書，後於次年重建並完成《天祿琳琅續編》。建築上，昭仁殿為單檐歇山頂，黃琉璃瓦覆頂，設有抱廈及後室，是院落內的重要結構。其東側的龍光門為正宮通往東路的通道。昭仁殿見證了明清兩代的重大歷史事件及文化發展。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 688, 
                y: 379, 
                width: 32, 
                height: 24, 
                text: "弘德殿", 
                description: "弘德殿位於北京故宮乾清宮西側，是一座承載深厚歷史的小殿，始建於明朝，原名「雝肅殿」，萬曆十四年（1586年）更名為「弘德殿」，並曾作為皇帝的寢宮。明朝時，弘德殿是皇帝召見臣工之處，清朝則成為皇帝辦理政務及讀書的重要場所。康熙帝曾在此進講經典、探討吏治，乾隆帝則題匾表彰此地。順治年間，弘德殿還用於祭告孔子，並以「弘德殿書房」之名聞名於同治年間。建築風格上，弘德殿為單檐歇山頂，黃琉璃瓦覆頂，設有抱廈與後室，內懸多處乾隆帝御題匾額。其西側的鳳彩門為正宮通往西路的通道，與昭仁殿東側的龍光門對稱，是一座見證明清歷史的重要建築。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 739, 
                y: 338, 
                width: 39, 
                height: 22, 
                text: "交泰殿", 
                description: "交泰殿位於北京故宮內廷，位於乾清宮與坤寧宮之間，建於明朝嘉靖年間以前，取名自《易經·泰卦》，寓意天地相交、萬物通泰。其平面為正方形，單檐四角攢尖頂，頂覆黃琉璃瓦，內部裝飾精美，設有盤龍藻井與寶座，並懸掛乾隆帝御書「無為」匾額。清朝時，交泰殿是皇后舉行慶典和管理宮務的重要場所，也是存放「二十五寶」的地方。這些印璽多用於發布詔令、軍事、司法及宗教活動，材質多樣，由宮殿監專責管理。殿內東側陳設有銅壺滴漏，西側放置大自鳴鐘，用於計時。清朝滅亡後，印璽移至故宮博物院珍寶館展出，交泰殿現作宮廷生活原狀陳列。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 731, 
                y: 294, 
                width: 56, 
                height: 16, 
                text: "坤寧宮", 
                description: "坤寧宮是北京故宮內廷後三宮之一。坤寧宮始建於明朝永樂十八年（1420年），正德九年（1514年）和萬曆二十四年（1596年）兩次遭火災，萬曆三十三年（1605年）重建。清朝順治元年（1645年）重修後，經順治十二年（1655年）再次改建成為薩滿祭祀場所，但其“中宮”地位未改變。清朝康熙四年（1665年），康熙帝大婚時，太皇太后指定大婚在坤寧宮行合卺禮。同治帝、光緒帝和溥儀的婚禮也在坤寧宮舉行，並且皇帝和皇后都在婚後短暫居住在此，然後遷入乾清宮或養心殿。雍正以後，皇帝移住養心殿，皇后則不再居住在坤寧宮，轉而選擇東六宮、西六宮之一。坤寧宮仍作為專供薩滿祭祀的場所，並且每天進行祭祀活動。坤寧宮的結構為坐北朝南，設有九間，其中包含用於皇帝大婚的東暖閣，這裡的陳設包括龍鳳喜床等婚禮用品。清朝道光至宣統年間，坤寧宮的東暖閣陳設相對穩定，只在大婚時有所調整。1959年起，坤寧宮內部被改為宮廷生活原狀陳列，並且在2003年到2006年進行了修繕，發現了歷史上的建築特徵如方形銅煙筒內襯等，並進行了保存和展示。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 733, 
                y: 255, 
                width: 52, 
                height: 15, 
                text: "坤寧門", 
                description: "坤寧門，位於北京紫禁城坤寧宮後台階下正中。坤寧門坐南朝北，南為坤寧宮，北通御花園。明朝初年，在御花園欽安殿以北設坤寧門，即如今的順貞門。如今的坤寧門及其東西兩側在明朝是一道圍廊，稱為「遊藝齋」，與御花園相接。明朝嘉靖十四年（1535年），坤寧宮後北圍廊正中的廣運門改建，同時將其改稱「坤寧門」，此名一直沿用至今。清朝順治十二年（1655年），坤寧門重修。坤寧門坐南朝北，面闊三間，單檐歇山頂，覆黃琉璃瓦。明間設有門，中一間裝有宮門兩扇。兩側間隔是值房，後檐設有兩抹頭方格檻窗，中配方格風窗，前檐是牆。坤寧門東西兩側的山牆斜出八字琉璃影壁，兩側接坤寧宮的東、西廡房。坤寧門是後三宮通向御花園的門。",
                color: "rgba(0, 200, 0, 0.5)"
            },{ 
                x: 737, 
                y: 125, 
                width: 52, 
                height: 20, 
                text: "欽安殿", 
                description: "欽安殿位於故宮御花園的正中偏北，建於明朝永樂十八年（1420年），並於嘉靖十四年（1535年）增建牆垣。殿內主要供奉玄天上帝。清朝乾隆時期，欽安殿進行了多次修繕，並在2005年恢復了乾隆年間的原貌。殿內設有五彩龍架大鐘與五彩鳳架大鼓等珍貴文物，並供奉玄天上帝的雕像。正北側有三個大龕，其中正龕的玄天上帝像為明朝永樂年間製作。此外，還有六尊「六從」神像，與五供香案一同擺放在殿內中央。欽安殿的前院有月台，四周圍繞著漢白玉欄杆，並設有天一門。每年元旦和重要節日，皇帝會在此設斗壇、拈香行禮，並設道場進行儀式。欽安殿自清代以來，成為皇家宗教儀式的重要場所。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 744, 
                y: 100, 
                width: 38, 
                height: 15, 
                text: "順貞門", 
                description: "順貞門位於紫禁城內廷中路的北端，是通往御花園的北門。始建於明朝初年，原名「坤寧門」，於嘉靖十四年（1535年）更名為「順貞門」，當時坤寧門遷至坤寧宮後北圍廊正中。順貞門為隨牆琉璃門建築，共有三座，每座均安裝有雙扇大門，並嵌有九顆門釘。門外是北橫街，與神武門相對，內部南向對承光門，左右兩側設有延和門與集福門。這些門之間以琉璃頂矮牆相連，圍成小院。順貞門是內廷通往神武門的重要通道，皇后和皇帝有時會經此出入。特別在舉辦道場或選秀等場合，順貞門的開啟受到嚴格控制。明清兩朝，宮中重大儀式或人物往來常經此門，並保持良好的保存狀態。",
                color: "rgba(0, 200, 0, 0.5)"
            }
        ];
        this.locations2 = [
            { 
                x: 703, 
                y: 755, 
                width: 114, 
                height: 40, 
                text: "太和殿", 
                description: "太和殿俗稱金鑾殿，為北京故宮外朝三大殿中最南面的殿。該殿是明清兩朝北京城內最高的建築，開間最多、進深最大和屋頂最高的大殿，堪稱中華第一殿。皇帝登基、冊立皇后等大典都在此舉行。太和殿是皇權的象徵，因而在各種形式上都刻意追求，以示與眾不同。太和殿並非皇帝日常上朝的地方，太和殿是只有在舉行大朝會或是皇帝御駕親征以及舉行重大儀式的地方，（皇帝平時處理公務的地方位在太和殿後方的乾清宮）。",
                color: "rgba(255, 165, 0, 1)"
            },
        ]
        this.locations3 = [
            { 
                x: 38, 
                y: 1116, 
                width: 10, 
                height: 28, 
                text: "西華門", 
                description: "西華門是北京紫禁城的西門，位於神武門和午門之間的西側。它原本是紫禁城內廷的主要出入口之一，與東華門相對。西華門修建於明永樂十八年，與紫禁城其他部分同期建成。其建築風格為重檐歇山頂，並配有黃琉璃瓦覆蓋，體現了皇家建築的尊貴與典雅。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 1460, 
                y: 1118, 
                width: 10, 
                height: 32, 
                text: "東華門", 
                description: "東華門是紫禁城的東門，位於紫禁城東城牆偏南，是故宮博物院除神武門外的另一個遊客出口。東華門始建於明朝永樂十八年（1420年）。清朝乾隆年間，東華門門樓被用於安放閱兵時的棉甲，並設置「恩豐倉」存放太監應領的米石。清初只允許內閣官員出入，乾隆中期則特許高齡的一、二品大員通行。東華門曾被民間稱為「鬼門」，原因在於清代皇帝、皇后、皇太后梓宮從此門出城，且門釘採用陰數的八路九顆格式。嘉慶年間的癸酉之變中，農民軍曾試圖經東華門進入紫禁城，但因意外被官兵發現而失敗。2015年，故宮博物院為慶祝建院90周年，開放了東華門及其古建築館。2020年3月16日，東華門因汽車撞擊損壞了一顆門釘。東華門坐西朝東，與西華門對應，外設下馬碑，內有文華殿和鑾儀衛內鑾駕庫，建築採黃琉璃瓦重檐廡殿頂，城樓形制與西華門相同，門匾現為銅質漢字。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 934, 
                y: 1135, 
                width: 20, 
                height: 30, 
                text: "協和門", 
                description: "協和門位於紫禁城外朝中路，太和門東側廊廡正中，是外朝通往東華門的重要通道，見證了多次重要歷史事件。明朝正統十四年（1449年），土木堡之變的消息傳入北京，引發震動，錦衣衛指揮馬順等王振餘黨在左順門附近被憤怒的大臣群起攻擊，馬順等人當場被亂拳打死，並懸屍於東安門外，史稱午門血案。此事穩定了京城局勢，也使左順門成為打擊宮廷小人的象徵。嘉靖三年（1524年），因世宗朱厚熜更改父母尊號之事，引發群臣不滿，兩百多名官員聚哭於左順門，試圖抗議朝廷的決策，史稱大禮議。這些事件顯示了協和門及周邊作為朝廷政治活動場所的特殊意義。協和門原名「左順門」，經歷了明清多次更名與修建，但其歷史地位始終未改，成為外朝政治風雲的見證者。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 560, 
                y: 1134, 
                width: 20, 
                height: 30, 
                text: "熙和門", 
                description: "熙和門位於紫禁城外朝中路，太和門外西側廡房正中，與協和門東西相對，是由西華門進入前朝的重要通道。此門始建於明永樂十八年（1420年），初名「右順門」。在明嘉靖年間，熙和門歷經多次火災與重建，名稱亦幾經更改：嘉靖四十一年（1562年）改名為「歸極門」，順治二年（1645年）改名為「雍和門」，乾隆元年（1736年）因避雍正皇帝諱而定名為「熙和門」。清乾隆二十三年（1758年），熙和門再度毀於火災，隨後重建。熙和門不僅是一座宮殿建築，還是歷代政治活動的重要場所。明代時，其梢間曾作為百官奏事之所，見證了多次朝廷政務的展開。清代時，熙和門南北兩側廡房則被用作翻書房及起居注館，分別承載文書整理及史書編纂的功能。儘管熙和門的建築形式相對簡約，但它在紫禁城中具有重要的交通與政治意義，連接外朝與前朝，是皇宮內外活動的重要通道之一。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 930, 
                y: 895, 
                width: 34, 
                height: 54, 
                text: "體仁閣", 
                description: "體仁閣，位於紫禁城太和殿前廣場東廡，與西廡弘義閣遙遙相對。體仁閣始建於明朝永樂十八年（1420年），初名「文樓」，後經多次改名，至清朝順治三年（1646年）改為現在的名稱。乾隆四十八年（1783年），體仁閣因火災被毀，隨後依照弘義閣的形制重建。體仁閣曾經存放《永樂大典》，並在明朝大朝會和重大典禮中發揮重要作用，如皇帝大婚、皇太子納妃儀式等。康熙年間，體仁閣成為舉辦博學鴻儒大比的場所，並為《明史》編纂提供了場所。清代乾隆年間，體仁閣的兩廡設有內務府庫房。歷經多次維修與加固，並在2003至2005年進行了故宮古建築修繕計劃，但由於修繕過程中發現部分結構問題，工程曾一度停工。體仁閣目前作為文物庫房使用，收藏了包括馬車在內的多項文物。建築上，體仁閣高25米，設有兩層，上層為七間，四面設有走廊，下層為九間，並擁有精美的琉璃瓦屋頂和支撐屋頂的方形擎檐柱，外觀莊重且氣勢雄偉。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 550, 
                y: 894, 
                width: 36, 
                height: 53, 
                text: "弘義閣", 
                description: "弘義閣，位於紫禁城太和殿前廣場西廡，與東廡體仁閣遙遙相對。弘義閣始建於明朝永樂十八年（1420年），最初稱為「武樓」，後於明嘉靖四十一年（1562年）改名「武成閣」，至清朝順治三年（1646年）改為「弘義閣」。明朝時，弘義閣作為公主出嫁的典禮場所，與文樓一同承辦皇帝的重大婚禮儀式。至清朝，弘義閣兩廡用作內務府的庫房，儲存金銀珠寶等貴重物品，並且為皇帝和皇后的宴會提供金銀器皿。弘義閣於1919年和1921年進行了加固維修，但因結構問題於1953年再次翻修。2005年，經過修繕的弘義閣重新開放，並作為故宮博物院的常設展覽場地，展示清朝宮廷音樂與典制樂器，讓觀眾了解清朝宮廷音樂的歷史與發展。展覽中的音樂復原採用了數字音頻技術，重現了當時宮廷的樂曲。2011年，弘義閣的展廳因內部調修暫停開放。弘義閣的建築風格與體仁閣相似，兩者作為太和殿的陪襯建築，具有對稱的結構。弘義閣保持了明朝天啟七年的建築遺構，其樓高23.8米，屋頂採用單檐廡殿頂，樓閣之間設有腰檐，既符合建築等級，又與周圍環境和諧。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 400, 
                y: 1042, 
                width: 17, 
                height: 42, 
                text: "凝道殿", 
                description: "武英殿的東配殿，面闊五間，黃琉璃瓦單檐懸山頂，原為前出廊，後改為正間前出廊。凝道殿以北有值房（廊房），頂覆黃琉璃瓦。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 299, 
                y: 1042, 
                width: 16, 
                height: 42, 
                text: "煥章殿", 
                description: "武英殿的西配殿，面闊五間，黃琉璃瓦單檐懸山頂，原為前出廊，後改為正間前出廊。煥章殿以北有值房（廊房），頂覆黃琉璃瓦。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 930, 
                y: 551, 
                width: 33, 
                height: 46, 
                text: "景運門", 
                description: "景運門（滿語：ᡤᡳᠩᠶᡡᠨᠮᡝᠨ，穆麟德轉寫：ging yūn men）位於紫禁城乾清門前廣場的東側，是內廷與外朝東路的重要通路，始建於明朝永樂十八年（1420年），萬曆二十六年（1598年）重修，清朝順治十二年（1655年）再度修葺。景運門與隆宗門相對，皆為通往乾清門前廣場的重要入口，因此又稱「禁門」。清朝時，規定親王以下及大員僅可至門外台階20步以外停立，嚴禁擅入門內，以示森嚴。2014年，為消除安全隱患，故宮博物院拆除了景運門內的彩鋼房，恢復其歷史原貌。景運門坐西朝東，面闊五間，採用黃琉璃瓦單檐歇山頂，單昂三跴斗拱，整體為徹上明造，梁枋繪以墨線大點金旋子彩畫，門道內外設有礓磋慢道，便於車輿通行。門內北側有蒙古王公大臣值房及九卿值房，南側為奏事待漏值所；門外東側為奉先殿，北側則是毓慶宮，構成紫禁城東部的重要建築群。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 550, 
                y: 551, 
                width: 36, 
                height: 45, 
                text: "隆宗門", 
                description: "隆宗門位於紫禁城乾清門前廣場的西側，與東側的景運門相對，是內廷與外朝西路及西苑的重要通道。隆宗門始建於明朝永樂十八年（1420年），萬曆二十六年（1598年）重修，清朝順治十二年（1655年）再次修葺。隆宗門非奏事待旨或宣召，王公大臣亦不得私入。清朝皇帝如康熙帝、雍正帝及道光帝均在紫禁城外西郊皇家園林駕崩，其梓宮迎入紫禁城時，均經隆宗門內舉行齋集舉哀儀式。嘉慶十八年（1813年）發生的「癸酉之變」與隆宗門關係密切。天理教起義軍在太監引導下攻至隆宗門，門已被守軍封閉，起義軍試圖翻牆進入，卻被養心殿守衛擊退，其中兩名天理教徒被皇二子旻寧（後來的道光帝）用火槍射殺。激戰中，有兩支箭射中隆宗門，一支留在門內側椽頭上，另一支嵌於門外額匾的「宗」字左側，現今僅餘箭鏃存留。2014年，為消除安全隱患，故宮博物院拆除了隆宗門內的彩鋼房（原為快餐廳）。隆宗門建築形式與景運門相同，面闊五間，採黃琉璃瓦單檐歇山頂，單昂三踩斗拱，徹上明造，梁枋以墨線大點金旋子彩畫裝飾。門道內外設礓磋慢道，方便車輿通行。隆宗門內北側為軍機處值房，門外正西則是慈寧宮，整體構成紫禁城西部的關鍵建築群。",
                color: "rgba(0, 200, 0, 1)"
            },{ 
                x: 1107, 
                y: 670, 
                width: 40, 
                height: 110, 
                text: "御茶膳房", 
                description: "御茶膳房位於紫禁城東路、南三所西側，是清朝負責宮內飲食及筵宴事務的重要機構，隸屬內務府。始於順治年間，初稱「茶房」與「膳房」，乾隆十三年（1748年）合併為「御茶膳房」，長官由皇帝特簡。其下設膳房、茶房、肉房與乾肉房，並在乾隆三十六年（1771年）設檔案房管理文書檔案，包括膳底檔等。御茶膳房的建築特色包括位於南三所西側的黃琉璃瓦房和多處分支機構，例如紫禁城內的膳房、養心殿御膳房、御茶房，以及各地御園與行宮的膳房。此外，清雍正年間曾下諭要求妥善處理飲食剩餘，體現清宮飲食管理的細緻與節儉。現代修繕工程亦對御茶膳房進行保護與修繕，成為故宮重要的歷史建築之一。",
                color: "rgba(0, 200, 0, 0.5)"
            }
        ]

        // 添加描述面板的引用
        this.descriptionPanel = document.getElementById('descriptionPanel');
        if (!this.descriptionPanel) {
            this.createDescriptionPanel();
        }
        
        this.bindEvents();
        this.loadMazeImage();
    }

    initializeCanvas() {
        // 設定固定的畫布大小
        const CANVAS_WIDTH = 1500;  // 或其他你想要的固定寬度
        const CANVAS_HEIGHT = 1321; // 或其他你想要的固定高度
        
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        // 使用 CSS 來控制顯示大小，保持長寬比
        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto';
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.objectFit = 'contain';
        
        // 防止畫布被壓縮
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = 'crisp-edges';
    }
    
    loadMazeImage() {
        this.mazeImage = new Image();
        this.mazeImage.onload = () => {
            // 初始化遊戲狀態
            gameState.isLoading = false;
            gameState.isInitialized = true;
    
            // 繪製迷宮圖像
            this.ctx.drawImage(this.mazeImage, 0, 0, this.canvas.width, this.canvas.height);
    
            // 生成碰撞地圖 (假設已有 generateCollisionMap 方法)
            this.generateCollisionMap();
    
            // 可視化碰撞地圖
            //this.visualizeCollisionMap();
    
            // 開始遊戲循環
            this.startGameLoop();
        };
        this.mazeImage.onerror = (error) => {
            gameState.error = '迷宮圖片載入失敗';
            console.error('圖片載入錯誤:', error);
        };
        this.mazeImage.src = './images/紫禁城平面圖.png';
    }

    generateCollisionMap() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
    
        // 建立空的二維陣列
        const collisionMap = Array.from({ length: canvasHeight }, () => 
            Array(canvasWidth).fill(0)
        );
    
        // 讀取整個畫布的像素資料
        const imageData = this.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
    
        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                const index = (y * canvasWidth + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
    
                // 如果是黑色像素（或近似黑色）
                if (r <= 20 && g <= 20 && b <= 20 && a > 0) {
                    collisionMap[y][x] = 1; // 直接標記為障礙物
                }
            }
        }
    
        this.collisionMap = collisionMap;
        console.log("碰撞地圖生成完成！");
    }

    // 創建描述面板
    createDescriptionPanel() {
        this.descriptionPanel = document.createElement('div');
        this.descriptionPanel.id = 'descriptionPanel';
        this.descriptionPanel.style.cssText = `
            position: fixed;
            right: 20px;
            top: 20px;
            width: 300px;
            padding: 20px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(this.descriptionPanel);
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasScaleX = this.canvas.width / rect.width;
        const canvasScaleY = this.canvas.height / rect.height;

        // 將初始的 lastValidMouse 座標轉換為畫布內部座標
        this.lastValidMouseX = (event.clientX - rect.left) * canvasScaleX;
        this.lastValidMouseY = (event.clientY - rect.top) * canvasScaleY;
        
        // 計算當前滑鼠在畫布上的位置
        const currentMouseX = (event.clientX - rect.left) * canvasScaleX;
        const currentMouseY = (event.clientY - rect.top) * canvasScaleY;

        console.log(`目標座標: x=${this.target.x}, y=${this.target.y}`);

        // 初始化或更新上一個有效的滑鼠位置
        if (this.lastValidMouseX === null) {
            this.lastValidMouseX = currentMouseX;
            this.lastValidMouseY = currentMouseY;
        }

        if (this.isDragging) {
            if (!this.target.following) {
                const dx = ((event.clientX - this.lastMouseX) * canvasScaleX);
                const dy = ((event.clientY - this.lastMouseY) * canvasScaleY);
    
                this.offsetX += dx;
                this.offsetY += dy;
    
                this.target.x += dx;
                this.target.y += dy;
                this.target.trail = this.target.trail.map(point => ({
                    x: point.x + dx,
                    y: point.y + dy
                }));
            }
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        } 
        
        if (this.target.following) {
            console.log("檢測碰撞:", {
                lastX: this.lastValidMouseX,
                lastY: this.lastValidMouseY,
                currentX: currentMouseX,
                currentY: currentMouseY
            });

            // 檢查碰撞
            if (this.isLineCollidingWithObstacle(
                this.lastValidMouseX,
                this.lastValidMouseY,
                currentMouseX,
                currentMouseY
            )) {
                console.log("檢測到碰撞!");
            
                if (this.target.trail.length >= 5) {
                    const trailPoints = [];
                    for (let i = 0; i < 5; i++) {
                        trailPoints.push(this.target.trail.pop()); // 移除並保存最後五個點
                    }
                
                    const lastTrailPoint = trailPoints[trailPoints.length - 1];
                    this.target.x = lastTrailPoint.x;
                    this.target.y = lastTrailPoint.y;
                
                    console.log("退回到最近的五個點:", trailPoints);
                }
            
                // 停止跟隨並更改目標顏色
                this.target.following = false;
                this.target.color = 'red';
                return;
            }

            // 更新目標位置
            this.target.x = currentMouseX;
            this.target.y = currentMouseY;
            
            // 添加新的軌跡點
            this.target.trail.push({
                x: this.target.x,
                y: this.target.y
            });

            // 限制軌跡長度
            if (this.target.trail.length > 1000) {
                this.target.trail.shift();
            }

            // 更新上一個有效的滑鼠位置
            this.lastValidMouseX = currentMouseX;
            this.lastValidMouseY = currentMouseY;
        }
    }

    handleMouseDown(event) {
        const { clientX: mouseX, clientY: mouseY } = event;

        if (event.button === 0) { // 左鍵
            this.isDragging = true;
            this.lastMouseX = mouseX;
            this.lastMouseY = mouseY;
        }
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    // 更新處理點擊事件
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasScaleX = this.canvas.width / rect.width;
        const canvasScaleY = this.canvas.height / rect.height;
        
        // 轉換滑鼠座標到畫布座標系統
        const adjustedMouseX = (event.clientX - rect.left) * canvasScaleX;
        const adjustedMouseY = (event.clientY - rect.top) * canvasScaleY;

        // 檢查是否點擊了目標
        if (this.isMouseOnTarget(event.clientX, event.clientY)) {
            this.target.following = !this.target.following;
            if (this.target.following) {
                this.target.trail = [{ x: this.target.x, y: this.target.y }];
                this.target.color = 'blue';
            } else {
                this.target.color = 'red';
            }
            return;
        }

        // 檢查是否點擊了地點物件
        const clickedLocation1 = this.locations1.find(loc => {
            const scaledX = loc.x * this.zoomFactor + this.offsetX;
            const scaledY = loc.y * this.zoomFactor + this.offsetY;
            const scaledWidth = loc.width * this.zoomFactor;
            const scaledHeight = loc.height * this.zoomFactor;

            return (
                adjustedMouseX >= scaledX &&
                adjustedMouseX <= scaledX + scaledWidth &&
                adjustedMouseY >= scaledY &&
                adjustedMouseY <= scaledY + scaledHeight
            );
        });
        const clickedLocation2 = this.locations2.find(loc => {
            const scaledX = loc.x * this.zoomFactor + this.offsetX;
            const scaledY = loc.y * this.zoomFactor + this.offsetY;
            const scaledWidth = loc.width * this.zoomFactor;
            const scaledHeight = loc.height * this.zoomFactor;

            return (
                adjustedMouseX >= scaledX &&
                adjustedMouseX <= scaledX + scaledWidth &&
                adjustedMouseY >= scaledY &&
                adjustedMouseY <= scaledY + scaledHeight
            );
        });
        const clickedLocation3 = this.locations3.find(loc => {
            const scaledX = loc.x * this.zoomFactor + this.offsetX;
            const scaledY = loc.y * this.zoomFactor + this.offsetY;
            const scaledWidth = loc.width * this.zoomFactor;
            const scaledHeight = loc.height * this.zoomFactor;

            return (
                adjustedMouseX >= scaledX &&
                adjustedMouseX <= scaledX + scaledWidth &&
                adjustedMouseY >= scaledY &&
                adjustedMouseY <= scaledY + scaledHeight
            );
        });


        if (clickedLocation1) {
            this.showDescription(clickedLocation1.text, clickedLocation1.description);
        }
        if (clickedLocation2) {
            this.showDescription(clickedLocation2.text, clickedLocation2.description);
        }
        if (clickedLocation3) {
            this.showDescription(clickedLocation3.text, clickedLocation3.description);
        }
    }

    // 顯示描述文字
    showDescription(title, description) {
        this.descriptionPanel.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">${title}</h3>
            <p style="margin: 0;">${description}</p>
        `;
    }

    // 更新縮放處理
    handleWheel(event) {
        event.preventDefault();
        
        if (this.target.following) return;

        const { clientX: mouseX, clientY: mouseY, deltaY } = event;
        const zoomDirection = deltaY < 0 ? 1 : -1;
        const zoomFactor = 1 + zoomDirection * config.zoomSpeed;
        const newZoom = this.zoomFactor * zoomFactor;

        if (newZoom >= config.minZoom && newZoom <= config.maxZoom) {
            const rect = this.canvas.getBoundingClientRect();
            const mousePos = {
                x: mouseX - this.offsetX,
                y: mouseY - this.offsetY
            };

            this.zoomFactor = newZoom;
            this.offsetX = mouseX - mousePos.x * zoomFactor;
            this.offsetY = mouseY - mousePos.y * zoomFactor;

            // 更新目標位置
            const targetRelativeX = (this.target.x - mouseX) * zoomFactor;
            const targetRelativeY = (this.target.y - mouseY) * zoomFactor;
            this.target.x = mouseX + targetRelativeX;
            this.target.y = mouseY + targetRelativeY;

            // 更新軌跡點
            this.target.trail = this.target.trail.map(point => ({
                x: mouseX + (point.x - mouseX) * zoomFactor,
                y: mouseY + (point.y - mouseY) * zoomFactor
            }));
        }
    }

    isMouseOnTarget(mouseX, mouseY) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasScaleX = this.canvas.width / rect.width;
        const canvasScaleY = this.canvas.height / rect.height;
        
        // 轉換滑鼠座標到畫布座標系統
        const adjustedMouseX = (mouseX - rect.left) * canvasScaleX;
        const adjustedMouseY = (mouseY - rect.top) * canvasScaleY;
        
        // 計算距離，考慮縮放和偏移
        const dist = Math.sqrt(
            (adjustedMouseX - this.target.x) ** 2 + 
            (adjustedMouseY - this.target.y) ** 2
        );
        
        return dist < (this.target.radius * this.zoomFactor * 2);
    }

    isLineCollidingWithObstacle(x1, y1, x2, y2) {
        if (!this.collisionMap) {
            console.error("碰撞地圖未生成！");
            return false;
        }
    
        // 將螢幕座標轉換為原始圖像座標
        const adjustedX1 = Math.round((x1 - this.offsetX) / this.zoomFactor);
        const adjustedY1 = Math.round((y1 - this.offsetY) / this.zoomFactor);
        const adjustedX2 = Math.round((x2 - this.offsetX) / this.zoomFactor);
        const adjustedY2 = Math.round((y2 - this.offsetY) / this.zoomFactor);
    
        const distance = Math.sqrt((adjustedX2 - adjustedX1) ** 2 + (adjustedY2 - adjustedY1) ** 2);
        const steps = Math.max(Math.ceil(distance), 10);
    
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.round(adjustedX1 + (adjustedX2 - adjustedX1) * t);
            const y = Math.round(adjustedY1 + (adjustedY2 - adjustedY1) * t);
    
            // 確保不超出地圖邊界
            if (
                x >= 0 && x < this.collisionMap[0].length &&
                y >= 0 && y < this.collisionMap.length
            ) {
                if (this.collisionMap[y][x] === 1) {
                    console.log("碰撞發生於點:", { x, y });
                    return true;
                }
            }
        }
    
        return false;
    }
    // 更新繪製函數
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        // 繪製迷宮背景
        if (gameState.isInitialized) {
            this.ctx.save();
            this.ctx.translate(this.offsetX, this.offsetY);
            this.ctx.scale(this.zoomFactor, this.zoomFactor);
            
            this.ctx.drawImage(
                this.mazeImage,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
            
            this.ctx.restore();
        }
    
        // 繪製地點物件
        this.drawLocations();
    
        // 繪製目標和軌跡
        this.drawTarget();
    
        // 繪製載入中或錯誤訊息
        if (gameState.isLoading) {
            this.drawMessage('載入中...');
        } else if (gameState.error) {
            this.drawMessage(gameState.error, 'red');
        }
    }

    // 繪製地點物件
    drawLocations() {
        this.locations1.forEach(loc => {
            const scaledX = loc.x * this.zoomFactor + this.offsetX;
            const scaledY = loc.y * this.zoomFactor + this.offsetY;
            const scaledWidth = loc.width * this.zoomFactor;
            const scaledHeight = loc.height * this.zoomFactor;

            // 繪製半透明背景
            this.ctx.fillStyle = loc.color;
            this.ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

            // 繪製文字
            this.ctx.fillStyle = 'black';
            const fontSize = 12 * this.zoomFactor; // 增加基礎字體大小
            this.ctx.font = `bold ${fontSize}px Arial`; // 添加粗體
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle'; // 確保垂直置中
            this.ctx.fillText(
                loc.text,
                scaledX + scaledWidth / 2,
                scaledY + scaledHeight / 2
            );
        });
        this.locations2.forEach(loc => {
            const scaledX = loc.x * this.zoomFactor + this.offsetX;
            const scaledY = loc.y * this.zoomFactor + this.offsetY;
            const scaledWidth = loc.width * this.zoomFactor;
            const scaledHeight = loc.height * this.zoomFactor;

            // 繪製半透明背景
            this.ctx.fillStyle = loc.color;
            this.ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

            // 繪製文字
            this.ctx.fillStyle = 'black';
            const fontSize = 24 * this.zoomFactor; // 增加基礎字體大小
            this.ctx.font = `bold ${fontSize}px Arial`; // 添加粗體
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle'; // 確保垂直置中
            this.ctx.fillText(
                loc.text,
                scaledX + scaledWidth / 2,
                scaledY + scaledHeight / 2
            );
        });
        this.locations3.forEach(loc => {
            const scaledX = loc.x * this.zoomFactor + this.offsetX;
            const scaledY = loc.y * this.zoomFactor + this.offsetY;
            const scaledWidth = loc.width * this.zoomFactor;
            const scaledHeight = loc.height * this.zoomFactor;

            // 繪製半透明背景
            this.ctx.fillStyle = loc.color;
            this.ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

            // 設置文字樣式
            this.ctx.fillStyle =  'black';
            const fontSize = 12 * this.zoomFactor;
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // 計算每個字符的位置
            const chars = loc.text.split('');
            const totalHeight = chars.length * fontSize;
            const startY = scaledY + (scaledHeight - totalHeight) / 2;
            const centerX = scaledX + scaledWidth / 2;

            // 逐個繪製字符
            chars.forEach((char, index) => {
                const charY = startY + (index + 0.5) * fontSize;
                this.ctx.fillText(char, centerX, charY);
            });
        });
    }
    
    visualizeCollisionMap() {
        if (!this.collisionMap) {
            console.error("碰撞地圖未生成！");
            return;
        }
    
        this.ctx.save();
    
        // 考慮偏移與縮放
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.zoomFactor, this.zoomFactor);
    
        // 遍歷碰撞地圖
        for (let y = 0; y < this.collisionMap.length; y++) {
            for (let x = 0; x < this.collisionMap[0].length; x++) {
                if (this.collisionMap[y][x] === 1) {
                    // 使用半透明紅色繪製障礙物
                    this.ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                    this.ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    
        this.ctx.restore();
    }

    drawTarget() {
        const scaledRadius = this.target.radius * this.zoomFactor;

        // 繪製軌跡
        if (this.target.trail.length > 1) {
            this.ctx.strokeStyle = `rgba(255, 0, 0, ${config.trailOpacity})`;
            this.ctx.beginPath();
            this.ctx.moveTo(this.target.trail[0].x, this.target.trail[0].y);
            this.target.trail.forEach(point => {
                this.ctx.lineTo(point.x, point.y);
            });
            this.ctx.stroke();
        }

        // 繪製目標外框
        this.ctx.strokeStyle = this.target.borderColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.target.x, this.target.y, scaledRadius + 2, 0, Math.PI * 2);
        this.ctx.stroke();

        // 繪製目標填充
        this.ctx.fillStyle = this.target.color;
        this.ctx.beginPath();
        this.ctx.arc(this.target.x, this.target.y, scaledRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawMessage(message, color = 'black') {
        this.ctx.fillStyle = color;
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            message,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

    startGameLoop() {
        const gameLoop = () => {
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// 初始化遊戲
const game = new MazeGame('gameCanvas');
