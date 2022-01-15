import React from "react";
import { defaultDifficulty, Difficulty } from "../constatus";

const Navigation = ({ length, difficulty = defaultDifficulty, onChangeDifficulty }) => {
  // upボタンが"5"以下の場合表示"5"以上の場合非表示
  const upVisibility = difficulty < Difficulty.length ? "" : "is-hidden";
  //   downボタンが"1"以上の場合表示"1"以下の場合非表示
  const downVisibility = difficulty > 1 ? "" : "is-hidden";
  //   インクリメントする関数（増やす）
  const onUpDifficulty = () => {
    onChangeDifficulty(difficulty + 1);
  };
  //   デクリメントする関数（減らす）
  const onDownDifficulty = () => {
    onChangeDifficulty(difficulty - 1);
  };

  return (
    <div className="navigation">
      <div className="navigation-item">
        <span className="navigation-label">Length: </span>
        <div className="navigation-item-number-container">
          <div className="num-board">{length}</div>
        </div>
      </div>
      <div className="navigation-item">
        <span className="navigation-label">Difficulty: </span>
        <div className="navigation-item-number-container">
          <span className="num-board">{difficulty}</span>
          <div className="difficulty-button-container">
            <div
              className={`difficulty-button difficulty-up ${upVisibility}`}
              onClick={onUpDifficulty}
            ></div>
            <div
              className={`difficulty-button difficulty-down ${downVisibility}`}
              onClick={onDownDifficulty}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
