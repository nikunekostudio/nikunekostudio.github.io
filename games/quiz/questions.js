/*
  株式の基礎知識を学ぶ全20問。
  answer は正解の選択肢番号（0〜3）です。
  en は英語版（?lang=en）で使用します。
*/
window.QUIZ_QUESTIONS = [
  {
    category:'倒産したらどうなる？',
    question:'株を買った会社が倒産！ 投資したお金はどうなる？',
    choices:['国が投資額を補償してくれる','追加で株主も会社の借金を返す義務がある','社長が投資額の半分は補償してくれる','投資額を超える責任は負わない'],
    answer:3,
    explanation:'通常の現物株式では株主は有限責任。会社の借金を肩代わりする義務は原則ない。',
    en:{category:'What happens in bankruptcy?',question:'A company you invested in goes bankrupt. What happens to your liability?',choices:['The government reimburses your investment','Shareholders must also repay the company’s debts','The CEO reimburses half the investment','You are not liable beyond your investment'],explanation:'Shareholders in ordinary cash equities have limited liability and generally do not have to repay the company’s debts.'}
  },
  {
    category:'赤字企業の配当',
    question:'会社が赤字でも配当金を出せる？',
    choices:['赤字なら法律で禁止されている','分配可能額などの条件を満たせば出せる','社長のポケットマネーからのみ出せる','株価が上がっていれば出せる'],
    answer:1,
    explanation:'当期赤字でも、法律上の分配可能額があれば配当できる場合がある。',
    en:{category:'Dividends from a loss-making company',question:'Can a company pay dividends even when it reports a loss?',choices:['The law always prohibits it','Yes, if conditions such as distributable amounts are met','Only from the CEO’s own money','Yes, whenever the share price rises'],explanation:'A company may be able to pay dividends despite a current-period loss if it has a legally distributable amount.'}
  },
  {
    category:'株価1円の会社',
    question:'株価が1円の会社。確実に言えることは？',
    choices:['明日にも倒産する','日本で最も割安な企業だ','時価総額は必ず1億円以下','株価だけでは企業の価値を判断できない'],
    answer:3,
    explanation:'株価と発行済株式数などを合わせて考える必要がある。',
    en:{category:'A ¥1 stock',question:'A company’s share price is ¥1. What can you say for certain?',choices:['It will go bankrupt tomorrow','It is Japan’s most undervalued company','Its market cap is always under ¥100 million','Share price alone cannot determine company value'],explanation:'Share price must be considered together with the number of shares outstanding and other factors.'}
  },
  {
    category:'会社を支配できる？',
    question:'ある会社の議決権の51％を持った。原則としてできることは？',
    choices:['即座に社長交代となる','株主総会の普通決議を単独で通す','会社の預金を自由に使える','会社の預金を51％まで使える'],
    answer:1,
    explanation:'通常の出席要件などを満たせば普通決議を可決できる。ただし特別決議には原則3分の2以上が必要。',
    en:{category:'Can you control the company?',question:'You hold 51% of a company’s voting rights. What can you generally do?',choices:['Replace the CEO immediately','Pass an ordinary shareholders’ resolution alone','Use the company’s cash freely','Use up to 51% of the company’s cash'],explanation:'Subject to normal quorum rules, 51% can pass an ordinary resolution. Special resolutions generally require at least two-thirds.'}
  },
  {
    category:'社員だけが知る好決算',
    question:'社員が未公表の重要な情報を知った。発表前に自社株を買うことはできる？',
    choices:['正社員なら問題なし。','500株は自由に買える。','インサイダー取引規制に違反する可能性がある','利益が出なければ合法'],
    answer:2,
    explanation:'未公表の重要事実を知って株を売買すると、一定の要件の下で違法になる。',
    en:{category:'Unpublished earnings information',question:'An employee learns material nonpublic information. Can they buy company shares before publication?',choices:['Yes, full-time employees may do so','They may freely buy up to 500 shares','It may violate insider-trading rules','It is legal if no profit is made'],explanation:'Trading while aware of material nonpublic facts may be illegal when the applicable conditions are met.'}
  },
  {
    category:'自社株買いの理由',
    question:'会社が自分の会社の株を買い戻すのはなぜ？',
    choices:['株価が必ずあがるため','株主還元や資本政策のため','会社の借金を帳消しにするため','株主全員に配るため'],
    answer:1,
    explanation:'自社株買いは株主還元や資本効率の改善などに使われる。',
    en:{category:'Why buy back shares?',question:'Why might a company repurchase its own shares?',choices:['To guarantee a higher share price','For shareholder returns and capital policy','To erase company debt','To distribute them to every shareholder'],explanation:'Share buybacks can be used for shareholder returns and to improve capital efficiency.'}
  },
  {
    category:'株主の権利',
    question:'上場企業の株を1株だけ買った。原則として得られる権利は？',
    choices:['社員になる権利','社長との面談','持ち株に応じた株主としての権利','得られる権利は何もない'],
    answer:2,
    explanation:'株主には配当請求や議決権などの権利がある。ただし単元株制度などによって行使できる権利は異なる。',
    en:{category:'Shareholder rights',question:'You buy one share of a listed company. What do you generally receive?',choices:['The right to become an employee','A meeting with the CEO','Shareholder rights according to your holding','No rights at all'],explanation:'Shareholders have rights such as dividends and voting, although exercisable rights vary under trading-unit rules and other systems.'}
  },
  {
    category:'優良企業なら儲かる？',
    question:'世界的な優良企業の株を買った。必ず儲かる？',
    choices:['優良企業なら絶対に儲かる','有名企業は株価が下がらない','配当だけで必ず元が取れる','損することもある'],
    answer:3,
    explanation:'会社の業績が優秀でも、買った株価が割高なら損失が出る場合がある。',
    en:{category:'Do great companies guarantee profit?',question:'You buy shares in a world-class company. Are profits guaranteed?',choices:['Great companies always make investors money','Famous companies never fall in price','Dividends always recover the purchase price','You can still lose money'],explanation:'Even an excellent business can produce an investment loss if the purchase price is too high.'}
  },
  {
    category:'株式分割',
    question:'会社が1株を2株に分割。理論上、何が起きる？',
    choices:['保有株数が2倍になり、1株の価値は半分になる','保有資産が即座に2倍になる','持ち株が半分没収される','会社の価値が2倍になる'],
    answer:0,
    explanation:'株式分割だけでは理論上、保有資産の総額は変わらない。',
    en:{category:'Stock splits',question:'A company splits each share into two. What happens in theory?',choices:['Your share count doubles and value per share halves','Your assets instantly double','Half your shares are confiscated','The company’s value doubles'],explanation:'A stock split alone does not theoretically change the total value of your holding.'}
  },
  {
    category:'株価が暴落したら',
    question:'株価が大きく急落したとき、市場で実際に使われることのある仕組みは？',
    choices:['全投資家への損失補填','一定条件下での取引の一時中断','株価の強制的な前日価格への巻き戻し','売却した投資家への罰金'],
    answer:1,
    explanation:'市場や商品によってはサーキットブレーカーなどで取引を一時中断する仕組みがある。',
    en:{category:'When prices crash',question:'What mechanism may actually be used when prices fall sharply?',choices:['Reimbursing every investor’s losses','Temporarily halting trading under certain conditions','Forcing prices back to the prior close','Fining investors who sold'],explanation:'Some markets and products use circuit breakers or similar mechanisms to halt trading temporarily.'}
  },
  {
    category:'株価と会社の関係',
    question:'上場会社の株価が半分になった。会社の現金も半分になる？',
    choices:['必ず半分になる','現金はすべて株主に移る','株価の下落だけでは会社の現金は減らない','証券取引所が半額を回収する'],
    answer:2,
    explanation:'株価は株式市場での評価。株価下落がそのまま会社の現預金の減少を意味するわけではない。',
    en:{category:'Share price and company cash',question:'A listed company’s share price halves. Does its cash also halve?',choices:['It always halves','All cash moves to shareholders','A price decline alone does not reduce company cash','The exchange collects half'],explanation:'The share price reflects market valuation; a decline does not itself mean the company’s cash has fallen.'}
  },
  {
    category:'株主優待',
    question:'株主優待について正しい説明は？',
    choices:['日本のすべての上場企業に義務がある','現金配当を出す会社は禁止されている','一度始めたら廃止できない','企業によっては実施していない'],
    answer:3,
    explanation:'株主優待は任意の制度で、実施していない企業もある。',
    en:{category:'Shareholder benefits',question:'Which statement about shareholder benefit programs is correct?',choices:['Every Japanese listed company must offer one','Companies paying cash dividends may not offer one','Once started, it can never be ended','Some companies do not offer one'],explanation:'Shareholder benefit programs are voluntary, and many companies do not offer them.'}
  },
  {
    category:'空売り',
    question:'空売りで利益が出る可能性があるのはどんなとき？',
    choices:['売った価格より安く買い戻したとき','株価が上がり続けたとき','企業の利益が増えていれば','配当が増えたときだけ'],
    answer:0,
    explanation:'借りた株などを売り、安く買い戻せれば差額が利益になる。ただし取引コスト等は別。',
    en:{category:'Short selling',question:'When can a short sale produce a profit?',choices:['When you buy back below the selling price','When the share price keeps rising','Whenever company profit rises','Only when dividends rise'],explanation:'Selling borrowed shares and buying them back more cheaply can create a profit before transaction costs.'}
  },
  {
    category:'空売りの恐怖',
    question:'空売りの損失について、正しい説明は？',
    choices:['投資額の半分までしか損しない','理論上、損失に上限がない','株価が2倍になると必ず利益が出る','取引所が損失を肩代わりする'],
    answer:1,
    explanation:'株価上昇に理論上の上限がないため、空売りの損失も理論上は無制限となる。',
    en:{category:'The risk of short selling',question:'Which statement about losses from short selling is correct?',choices:['You can lose only half the investment','Losses are theoretically unlimited','A doubling price always creates profit','The exchange covers the loss'],explanation:'Because a share price has no theoretical upper limit, a short seller’s loss is also theoretically unlimited.'}
  },
  {
    category:'株は誰から買う？',
    question:'証券取引所で上場株を普通に購入した場合、お金は主に誰に渡る？',
    choices:['株式を発行した企業','日本銀行','その株を売った相手','企業の社長個人'],
    answer:2,
    explanation:'通常の市場売買では、売り手から株式を購入する。企業への直接的な資金提供とは異なる。',
    en:{category:'Who sells you the shares?',question:'When you normally buy listed shares on an exchange, who mainly receives the money?',choices:['The company that issued the shares','The Bank of Japan','The party selling the shares','The company’s CEO personally'],explanation:'In ordinary secondary-market trading, you buy from a seller rather than directly funding the company.'}
  },
  {
    category:'配当金の落とし穴',
    question:'高配当株について正しい説明は？',
    choices:['配当利回りが高ければ絶対に安全','配当金が多い企業は倒産しない','配当は法律で保証される','業績などによって減配・無配になることもある'],
    answer:3,
    explanation:'配当は企業の業績や財務方針などで変更される可能性がある。',
    en:{category:'The high-dividend trap',question:'Which statement about high-dividend shares is correct?',choices:['A high yield is always safe','Companies paying large dividends never fail','Dividends are guaranteed by law','Dividends may be cut or suspended'],explanation:'Dividends may change with business performance, financial policy, and other factors.'}
  },
  {
    category:'倒産した会社の株',
    question:'会社が倒産したら、株主は必ず1円も回収できない？',
    choices:['必ずゼロになる','清算後に残余財産があれば分配を受ける場合がある','国が購入価格で買い取る','社長の財産を株主で山分けする'],
    answer:1,
    explanation:'債権者などへの支払い後に残余財産がある場合、株主に分配されることがある。',
    en:{category:'Shares after bankruptcy',question:'After bankruptcy, are shareholders guaranteed to recover nothing?',choices:['They always receive zero','They may receive a distribution if assets remain after liquidation','The government buys at the purchase price','Shareholders divide the CEO’s property'],explanation:'Shareholders may receive remaining assets after creditors and others have been paid, although this is not guaranteed.'}
  },
  {
    category:'株価が上がっても会社は？',
    question:'株価が10倍になった会社について、必ず言えることは？',
    choices:['社員の給料も10倍になった','会社の売上も10倍になった','株式市場での評価が大きく上昇した','会社の銀行預金が10倍になった'],
    answer:2,
    explanation:'株価上昇は市場評価の変化。売上・給料・現預金が同じ割合で増えるとは限らない。',
    en:{category:'When the share price rises',question:'A company’s share price rises tenfold. What can you say for certain?',choices:['Employee salaries also rose tenfold','Sales also rose tenfold','Its stock-market valuation rose sharply','Its bank deposits rose tenfold'],explanation:'A price rise is a change in market valuation; sales, salaries, and cash need not rise by the same proportion.'}
  },
  {
    category:'チャートだけで予測',
    question:'ある株が3日連続で上昇した。翌日の上昇確率について確実に言えることは？',
    choices:['50％より高い','必ず50％','50％より低い','3日連続の結果だけでは判断できない'],
    answer:3,
    explanation:'過去3日間の上昇だけでは、翌日の上昇確率は確定できない。',
    en:{category:'Predicting from a chart alone',question:'A stock rose for three straight days. What can be said with certainty about tomorrow’s chance of rising?',choices:['It is above 50%','It is exactly 50%','It is below 50%','Three days alone are not enough to determine it'],explanation:'Three prior up days alone do not establish the probability of another rise.'}
  },
  {
    category:'株主が社長に命令？',
    question:'株主になったら会社の社長に直接命令できる？',
    choices:['1株でも持っていれば自由に命令できる','株主という立場だけでは直接業務命令できない','配当を放棄すれば命令できる','株式を10年以上持てば命令できる'],
    answer:1,
    explanation:'株主は株主総会の議決権などを通じて経営に関与する。個々の株主が社長に業務命令する権限を得るわけではない。',
    en:{category:'Can shareholders order the CEO?',question:'Can a shareholder directly give business orders to the CEO?',choices:['One share lets you give any order','Shareholder status alone gives no direct authority to issue business orders','You can if you waive dividends','You can after holding shares for ten years'],explanation:'Shareholders participate through rights such as votes at meetings; an individual shareholder does not gain direct authority to order the CEO.'}
  }
];
