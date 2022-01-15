// 関数達

import { useState, useEffect, useCallback } from "react";
import {
  defaultIntarval,
  defaultDifficulty,
  Delta,
  Difficulty,
  Direction,
  DirectionKeyCodeMap,
  GameStatus,
  OppositeDirection,
  initialPosition,
  initialValues,
} from "../constatus";
import { initFields, isCollision, isEatingMyself, getFoodPosition } from "../utils";

let timer = null;

const unsubscribe = () => {
  // undefinedじゃなかったら処理を終了
  if (!timer) {
    return;
  }
  clearInterval(timer);
};

const useSnakeGame = () => {
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
    //ゲームの中の時間を管理する
    const interval = Difficulty[difficulty - 1];
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
  const start = () => {
    setStatus(GameStatus.playing);
  };

  const stop = () => {
    setStatus(GameStatus.suspended);
  };

  // リスタートボタンの中身（stateをすべて初期値に戻して再実行している）
  const reload = () => {
    timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, defaultIntarval);
    setDirection(Direction.up);
    setStatus(GameStatus.init);
    setBody([initialPosition]);
    setFields(initFields(35, initialPosition));
  };

  // newDirection=押されたボタンの内容（矢印）
  const updateDirection = useCallback(
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

  const updateDifficulty = useCallback(
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

      updateDirection(newDirection);
    };
    // キーを押したときにhandleKeyDownが発火
    document.addEventListener("keydown", handleKeyDown);
    // キーを押したときに前回発火していたものが消える
    return () => document.removeEventListener("keydown", handleKeyDown);
    // updateDirectionが変更されるたびに発火
  }, [updateDirection]);

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
      // 定数foodにFoodPosition関数を代入
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

  return {
    body,
    difficulty,
    fields,
    status,
    start,
    stop,
    reload,
    updateDirection,
    updateDifficulty,
  };
};

export default useSnakeGame;