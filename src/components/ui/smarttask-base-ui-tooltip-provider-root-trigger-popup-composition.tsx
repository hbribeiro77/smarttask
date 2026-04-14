"use client";

import * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

export function SmarttaskBaseUiTooltipProviderRootTriggerPopupComposition({
  children,
  content,
  contentClassName,
  side = "top",
  align = "center",
  sideOffset = 6,
  delay = 350,
  triggerClassName,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  contentClassName?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  delay?: number;
  triggerClassName?: string;
  "aria-label": string;
}) {
  return (
    <Tooltip.Provider delay={delay}>
      <Tooltip.Root>
        <Tooltip.Trigger
          type="button"
          className={triggerClassName}
          aria-label={ariaLabel}
        >
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner
            side={side}
            align={align}
            sideOffset={sideOffset}
            className="z-50"
          >
            <Tooltip.Popup
              className={cn(
                "max-w-[min(20rem,calc(100vw-1.5rem))] rounded-md border border-border bg-popover px-3 py-2 text-xs leading-snug text-popover-foreground shadow-md",
                contentClassName
              )}
            >
              {content}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
