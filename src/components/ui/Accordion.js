"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Accessible accordion.
 *
 * - The trigger is a real <button> with aria-expanded / aria-controls.
 * - The panel animates height only while it is open (measured from the DOM),
 *   and remains in the accessibility tree while visible.
 * - Keyboard: Tab reaches each trigger, Enter/Space toggles (native button).
 * - `allowMultiple` is off by default so only one answer is open at a time.
 */
export default function Accordion({ items, allowMultiple = false, defaultOpen = null }) {
  // `!= null` (not a truthy check): index 0 is a valid default.
  const [openIds, setOpenIds] = useState(() => (defaultOpen != null ? [defaultOpen] : []));
  const baseId = useId();

  const toggle = (id) => {
    setOpenIds((current) => {
      const isOpen = current.includes(id);
      if (allowMultiple) {
        return isOpen ? current.filter((value) => value !== id) : [...current, id];
      }
      return isOpen ? [] : [id];
    });
  };

  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {items.map((item, index) => {
        const open = openIds.includes(item.id ?? index);
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <AccordionRow
            key={item.id ?? index}
            item={item}
            open={open}
            onToggle={() => toggle(item.id ?? index)}
            panelId={panelId}
            buttonId={buttonId}
          />
        );
      })}
    </div>
  );
}

function AccordionRow({ item, open, onToggle, panelId, buttonId }) {
  const innerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-5 py-5 text-left transition-colors hover:text-fog md:py-6"
        >
          <span className="flex-1 text-[1rem] font-medium leading-snug text-fog md:text-[1.0625rem]">
            {item.q}
          </span>
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
              open ? "border-signal bg-signal/15 text-signal" : "border-white/15 text-ash group-hover:border-white/35"
            }`}
            aria-hidden="true"
          >
            <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}>
              <Plus size={15} />
            </motion.span>
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.38, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <div ref={innerRef} className="pb-6 pr-10 text-sm leading-relaxed text-ash md:pr-24 md:text-[0.9375rem]">
              {item.a}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
