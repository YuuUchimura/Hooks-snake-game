// 第１引数には35,第２引数除外したい座標が入る
export const getFoodPosition = (fieldSize, excludes) => {
  while (true) {
    // fieldSize => 35
    // 1~33のランダムな数字をxに代入　　　// 1~33のランダムな数字をyに代入
    const x = Math.floor(Math.random() * (fieldSize - 1 - 1)) + 1;
    const y = Math.floor(Math.random() * (fieldSize - 1 - 1)) + 1;

    // 下で実行している際、第２引数に[snake] が入っているため、itemは[snake]となる
    // snakeと場所が被ったらtrue被らなければfalse
    // while文のためfalseになるまで繰り返される（なかなか被ることはないけど。。。）
    const conflict = excludes.some((item) => item.x === x && item.y === y);
    // 被らなかった場合下記を実行
    if (!conflict) {
      // オブジェクト形式で返す
      return { x, y };
    }
  }
};

export const initFields = (fieldSize, snake) => {
  // fields配列の生成
  const fields = [];
  // fieldSizeの数だけ繰り返し処理（35回）
  for (let i = 0; i < fieldSize; i++) {
    // fieldSizeという名の配列を生成（中身はからの文字列）
    // それを定数colsに代入
    const cols = new Array(fieldSize).fill("");
    // field配列の中にcols配列をpushする（これで二次元配列になる）
    fields.push(cols);
  }
  // これは初期値 => fields[17][17]となっている。
  // その中に"snake"を入れている
  fields[snake.y][snake.x] = "snake";

  // 定数foodにgetFoodPosition関数を代入
  // 中身は{x: ??, y: ??}となっている
  const food = getFoodPosition(fieldSize, [snake]);

  // fields[food.y][food.x]をfoodとする
  fields[food.y][food.x] = "food";
  // console.log(food)
  return fields;
};
