import React, { useState } from "react";
import styles from "./Suggestion.module.css";

export default function Suggestion() {
  const [suggestionStatus, setSuggestionStatus] = useState(true);
  const [suggestionOptions, setSuggestionOptions] = useState([
    "Yes, sure",
    "May be later",
    "Spring Catalogue",
  ]);
  const optionSelect = (data: any) => {};
  return (
    <>
      {suggestionStatus && (
        <div className={styles.suggestionWrapper}>
          <div className={styles.suggestionNote}>
            <p></p>
          </div>
          <ul className={styles.suggestionOptionList}>
            {suggestionOptions?.map((data, index) => {
              return (
                <li key={index} onClick={(data) => optionSelect(data)}>
                  {data}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
