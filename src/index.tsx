import React, { useEffect, useRef, useState } from 'react';
import './index.css';

const SQRT2 = Math.SQRT2;

type Place =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';

interface Grid {
  row0: string;
  row1: string;
  row2: string;
  col0: string;
  col1: string;
  col2: string;
}

interface Style {
  [k: string]: string | number;
}

// 计算tip放置位置的left，top值
function getPlacement(
  { row0, row1, row2, col0, col1, col2 }: Grid,
  place: Place
) {
  const positionStyle: Style = {};

  switch (place) {
    case 'top':
      positionStyle.left = col1;
      positionStyle.top = row0;
      break;
    case 'bottom':
      positionStyle.left = col1;
      positionStyle.top = row2;
      break;
    case 'left':
      positionStyle.left = col0;
      positionStyle.top = row1;
      break;
    case 'right':
      positionStyle.left = col2;
      positionStyle.top = row1;
      break;
    case 'top-left':
      positionStyle.left = col0;
      positionStyle.top = row0;
      break;
    case 'top-right':
      positionStyle.left = col2;
      positionStyle.top = row0;
      break;
    case 'bottom-left':
      positionStyle.left = col0;
      positionStyle.top = row2;
      break;
    case 'bottom-right':
      positionStyle.left = col2;
      positionStyle.top = row2;
      break;
    case 'center':
      positionStyle.left = col1;
      positionStyle.top = row1;
      break;
  }
  return positionStyle;
}

// 计算箭头的transform值，和一些相关的style
function getStyle(
  tipWidth: number,
  tipHeight: number,
  place: Place,
  arrowSize: number
) {
  const arrowStyle: Style = {};
  const contentStyle: Style = {};

  switch (place) {
    case 'top':
      arrowStyle.transform = `translate(${(tipWidth - arrowSize) / 2}px, ${
        -arrowSize / 2
      }px) rotate(0.375turn)`;
      break;

    case 'bottom':
      arrowStyle.transform = `translate(${(tipWidth - arrowSize) / 2}px, ${
        -tipHeight + arrowSize / 2
      }px) rotate(-0.125turn)`;
      break;

    case 'left':
      arrowStyle.transform = `translate(${tipWidth - arrowSize / 2}px, ${
        -(tipHeight - arrowSize + arrowSize) / 2
      }px) rotate(0.125turn)`;
      break;

    case 'right':
      arrowStyle.transform = `translate(${-arrowSize / 2}px, ${
        -(tipHeight - arrowSize + arrowSize) / 2
      }px) rotate(-0.375turn)`;
      break;

    case 'top-left':
      arrowStyle.visibility = 'hidden';
      contentStyle.borderBottomRightRadius = 0;
      contentStyle.transform = `translate(${arrowSize / SQRT2}px, ${
        arrowSize / SQRT2
      }px)`;
      break;

    case 'top-right':
      arrowStyle.visibility = 'hidden';
      contentStyle.borderBottomLeftRadius = 0;
      contentStyle.transform = `translate(${-arrowSize / SQRT2}px, ${
        arrowSize / SQRT2
      }px)`;
      break;

    case 'bottom-left':
      arrowStyle.visibility = 'hidden';
      contentStyle.borderTopRightRadius = 0;
      contentStyle.transform = `translate(${arrowSize / SQRT2}px, ${
        -arrowSize / SQRT2
      }px)`;
      break;

    case 'bottom-right':
      arrowStyle.visibility = 'hidden';
      contentStyle.borderTopLeftRadius = 0;
      contentStyle.transform = `translate(${-arrowSize / SQRT2}px, ${
        -arrowSize / SQRT2
      }px)`;
      break;

    case 'center':
      arrowStyle.visibility = 'hidden';
      break;
  }

  return { arrowStyle, contentStyle };
}

interface TooltipProps {
  children: React.ReactNode;
  place?: Place;
  size?: number;
  width?: 'max-content';
  arrowSize?: number;
}

function Tooltip({
  children,
  place = 'top',
  size = 1,
  width = 'max-content',
  arrowSize = 8,
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [isShow, setIsShow] = useState(false);
  const [tipWidth, setTipWidth] = useState(0);
  const [tipHeight, setTipHeight] = useState(0);

  let positionStyle = {};
  let arrowStyle = {};
  let contentStyle = {};

  function changeCss(): void {
    if (
      tooltipRef.current !== null &&
      tooltipRef.current.parentNode !== null &&
      isShow
    ) {
      const parent = (
        tooltipRef.current.parentNode as Element
      ).getBoundingClientRect();
      const viewHeight = window.screen.height;
      const viewWidth = window.screen.width;

      const row0 =
        Math.max(parent.top - tipHeight + arrowSize - arrowSize / SQRT2, 0) +
        'px';
      const row1 =
        parent.top + (parent.height - tipHeight + arrowSize) / 2 + 'px';
      const row2 =
        Math.min(parent.bottom + arrowSize / SQRT2, viewHeight - tipHeight) +
        'px';
      const col0 =
        Math.max(parent.left - tipWidth - arrowSize / SQRT2, 0) + 'px';
      const col1 = parent.left + (parent.width - tipWidth) / 2 + 'px';
      const col2 =
        Math.min(parent.right + arrowSize / SQRT2, viewWidth - tipWidth) + 'px';

      positionStyle = getPlacement(
        { row0, row1, row2, col0, col1, col2 },
        place
      );

      ({ arrowStyle, contentStyle } = getStyle(
        tipWidth,
        tipHeight,
        place,
        arrowSize
      ));
    }
  }
  changeCss();

  useEffect(() => {
    if (tooltipRef.current !== null && isShow) {
      const { width, height } = tooltipRef.current.getBoundingClientRect();
      setTipWidth(width);
      setTipHeight(height);
    }
  }, [isShow]);

  // 给父组件注册鼠标覆盖事件
  useEffect(() => {
    if (tooltipRef.current !== null) {
      const parent = tooltipRef.current.parentNode;

      if (parent !== null) {
        const handlePointerEnter = () => {
          setIsShow(true);
        };
        const handlePointerLeave = () => {
          setIsShow(false);
        };

        parent.addEventListener('pointerenter', handlePointerEnter);
        parent.addEventListener('pointerleave', handlePointerLeave);

        return () => {
          parent.removeEventListener('pointerenter', handlePointerEnter);
          parent.removeEventListener('pointerleave', handlePointerLeave);
        };
      }
    }
  }, []);

  return (
    <div
      ref={tooltipRef}
      className="tooltip"
      style={{
        ...positionStyle,
        fontSize: size + 'rem',
        width,
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {isShow && (
        <>
          <div
            className="tooltip-content"
            style={{ ...contentStyle }}
          >
            &nbsp;{children}&nbsp;
          </div>
          <div
            className="tooltip-arrow"
            style={{
              ...arrowStyle,
              width: arrowSize + 'px',
              height: arrowSize + 'px',
            }}
          ></div>
        </>
      )}
    </div>
  );
}

export default function TooltipWrapper(props: TooltipProps) {
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }

  return <Tooltip {...props} />;
}
