"use client";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";

export const SlashMenu = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }
      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }
      if (event.key === "Enter") {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="z-[99999] h-auto max-h-[360px] w-[320px] overflow-y-auto rounded-xl border border-(--outline) bg-(--card) shadow-2xl p-2 scrollbar-admin">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            type="button"
            key={index}
            // CRITICAL: Prevents the editor from losing focus when clicking
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={cn(
              "w-full flex items-center text-left gap-3 px-2 py-1.5 text-body-4 rounded-lg cursor-pointer select-none transition-colors",
              index === selectedIndex ? "bg-(--state-hover)" : "hover:bg-(--state-hover)"
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 border border-(--outline) bg-(--bg) rounded-md shadow-sm shrink-0">
              {item.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className=" text-(--on-bg-high) truncate">{item.title}</span>
              <span className="text-body-5 text-(--on-bg-medium) truncate">{item.description}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-4 text-center text-body-4 text-(--on-bg-medium)">
          Ничего не найдено
        </div>
      )}
    </div>
  );
});

SlashMenu.displayName = "SlashMenu";
