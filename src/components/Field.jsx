import React from "react";
// y＝縦軸
// ｘ＝横軸
const Field = ({ fields }) => {
  return (
    <div className="field">
        {/* 縦横35個の二次元配列ができる */}
      {fields.map((row) => {
        return row.map((column) => {
          return <div className={`dots ${column}`}></div>;
        });
      })}
    </div>
  );
};

export default Field;
