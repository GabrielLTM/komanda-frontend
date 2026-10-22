import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useAccessibleDialog(onClose) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const previouslyFocused = document.activeElement;
    const parent = dialog.parentElement;
    const changedSiblings = [];
    if (parent) {
      [...parent.children].filter((child) => child !== dialog).forEach((child) => {
        changedSiblings.push({ child, inert: child.inert, ariaHidden: child.getAttribute('aria-hidden') });
        child.inert = true;
        child.setAttribute('aria-hidden', 'true');
      });
    }
    dialog.querySelector(FOCUSABLE)?.focus();

    return () => {
      changedSiblings.forEach(({ child, inert, ariaHidden }) => {
        child.inert = inert;
        if (ariaHidden === null) child.removeAttribute('aria-hidden');
        else child.setAttribute('aria-hidden', ariaHidden);
      });
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, []);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = [...dialog.querySelectorAll(FOCUSABLE)];
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return { dialogRef, onKeyDown };
}
