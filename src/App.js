import React, { useState, useEffect, useCallback } from "react";
import Navigation from "./components/Navigation";
import Field from "./components/Field";
import Button from "./components/Button";
import ManipulationPanel from "./components/ManipulationPanel";
import { initFields, getFoodPosition } from "./utils";

// 初期値たち
const initialPosition = { x: 17, y: 17 };
const initialValues = initFields(35, initialPosition);
const defaultIntarval = 200;
const defaultDifficulty = 3;

const Difficulty = [1000, 500, 100, 50, 10];

const GameStatus = Object.freeze({
  init: "init",
  playing: "playing",
  suspended: "suspended",
  gameover: "gameover",
});

const Direction = Object.freeze({
  up: "up",
  right: "right",
  left: "left",
  down: "down",
});

const DirectionKeyCodeMap = Object.freeze({
  37: Direction.left,
  38: Direction.up,
  39: Direction.right,
  40: Direction.down,
});

const OppositeDirection = Object.freeze({
  up: "down",
  right: "left",
  left: "right",
  down: "up",
});

const Delta = Object.freeze({
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 },
});

let timer = undefined;

const unsubscribe = () => {
  // undefinedじゃなかったら処理を終了
  if (!timer) {
    return;
  }
  clearInterval(timer);
};

// フィールド内に入っているか判定する関数
// 入っていなければtrue入っていればfalse
const isCollision = (fieldSize, position) => {
  // 入っていない時
  if (position.y < 0 || position.x < 0) {
    return true;
  }
  // 大きくなりすぎて枠に収まらない
  if (position.y > fieldSize - 1 || position.x > fieldSize - 1) {
    return true;
  }

  return false;
};

const isEatingMyself = (fields, position) => {
  return fields[position.y][position.x] === "snake";
};

function App() {
  const [fields, setFields] = useState(initialValues);
  const [body, setBody] = useState([]);
  const [status, setStatus] = useState(GameStatus.init);
  const [direction, setDirection] = useState(Direction.up);
  const [difficulty, setDifficulty] = useState(defaultDifficulty);
  const [tick, setTick] = useState(0);

  // 初回のみレンダリングされる
  useEffect(() => {
    // １秒毎に更新される数値が入る
    setBody([initialPosition]);
    // テスト用
    // setBody(new Array(15).fill("").map((_item, index) => ({ x: 17, y: 17 + index })));
    //ゲームの中の時間を管理する
    const interval = Difficulty[difficulty - 1]
    timer = setInterval(() => {
      // 初期値の秒数ごとに１足される
      setTick((tick) => tick + 1);
      // intarval=初期値の秒数
    }, interval);

    return unsubscribe;
  }, [difficulty]);

  useEffect(() => {
    // positionが空じゃないまたはプレイ中じゃない時は実行されない
    if (body.length === 0 || status !== GameStatus.playing) {
      return;
    }

    const canContinue = handleMoving();
    if (!canContinue) {
      setStatus(GameStatus.gameover);
    }
  }, [tick]);

  // スタートボタンの中身
  const onStart = () => {
    setStatus(GameStatus.playing);
  };

  const onStop = () => {
    setStatus(GameStatus.suspended);
  };

  // リスタートボタンの中身（stateをすべて初期値に戻して再実行している）
  const onReStart = () => {
    timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, defaultIntarval);
    setDirection(Direction.up);
    setStatus(GameStatus.init);
    setBody([initialPosition]);
    setFields(initFields(35, initialPosition));
  };

  // newDirection=押されたボタンの内容（矢印）
  const onChangeDirection = useCallback(
    (newDirection) => {
      // プレイ中でなければ実行されない
      if (status !== GameStatus.playing) {
        return;
      }
      // 進んでいる方向と逆方向を押しても実行されない
      if (OppositeDirection[direction] === newDirection) {
        return;
      }
      // それ以外は実行される
      // ここのsetDirectionはup(初期値)
      setDirection(newDirection);
    },
    // directionとstatusが変更されたときに実行される
    [direction, status]
  );

  const onChangeDifficulty = useCallback(
    (difficulty) => {
      if (status !== GameStatus.init) {
        return;
      }
      if (difficulty < 1 || difficulty > difficulty.length) {
        return;
      }
      setDifficulty(difficulty);
    },
    [status, difficulty]
  );

  useEffect(() => {
    // キーを押したときにそのキーコードを取得する関数
    const handleKeyDown = (e) => {
      // 変数DirectionKeyCodeMapの中に入っているコードをnewDirectionに代入
      const newDirection = DirectionKeyCodeMap[e.keyCode];
      // 変数DirectionKeyCodeMapの中に入っているコード以外を押した場合は何もしない
      if (!newDirection) {
        return;
      }

      onChangeDirection(newDirection);
    };
    // キーを押したときにhandleKeyDownが発火
    document.addEventListener("keydown", handleKeyDown);
    // キーを押したときに前回発火していたものが消える
    return () => document.removeEventListener("keydown", handleKeyDown);
    // onChangeDirectionが変更されるたびに発火
  }, [onChangeDirection]);

  const handleMoving = () => {
    // フィールドの新しい座標を取得
    const { x, y } = body[0];
    // Delta=押した方向に進む[direction]で方向を指定する。
    // それを変数delta に代入
    const delta = Delta[direction];
    // 押した方向に進んだ時の場所を更新し、newPositionに代入
    const newPosition = {
      x: x + delta.x,
      y: y + delta.y,
    };

    if (
      isCollision(fields.length, newPosition) ||
      isEatingMyself(fields, newPosition)
    ) {
      unsubscribe();
      return false;
    }

    // 配列を展開
    // 後述の削除のために展開している
    const newBody = [...body];
    // 移動した先が"food"でなければ末尾を削除（pop()）
    if (fields[newPosition.y][newPosition.x] !== "food") {
      // 定数removingTrackに配列の中に入っている末尾を指定
      const removingTrack = newBody.pop();
      // 末尾に("")を代入
      fields[removingTrack.y][removingTrack.x] = "";
    } else {
      // 定数foodにgetFoodPosition関数を代入
      // fields.lengthは35
      // 第２引数は除外したい座標のため、（...newBodyはスネークの体部分newPositionは次に進む部分）
      const food = getFoodPosition(fields.length, [...newBody, newPosition]);
      fields[food.y][food.x] = "food";
    }
    fields[newPosition.y][newPosition.x] = "snake";
    // 移動した先を追加（先頭）
    newBody.unshift(newPosition);

    setBody(newBody);
    setFields(fields); // フィールドを更新

    return true;
  };

  return (
    <div className="App">
      <header className="header">
        <div className="title-container">
          <h1 className="title">Snake Game</h1>
        </div>
        <Navigation
          length={body.length}
          difficulty={difficulty}
          onChangeDifficulty={onChangeDifficulty}
        />
      </header>
      <main className="main">
        <Field fields={fields} />
      </main>
      <footer className="footer">
        <Button
          status={status}
          onStop={onStop}
          onStart={onStart}
          onRestart={onReStart}
        />
        <ManipulationPanel onChange={onChangeDirection} />
      </footer>
    </div>
  );
}

export default App;
