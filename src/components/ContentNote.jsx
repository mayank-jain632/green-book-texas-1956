import { useEffect, useRef } from 'react';

const SEEN_KEY = 'content-note-seen';
const readSeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};
const writeSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage unavailable; the note simply shows again next load */
  }
};

/** Modal note shown at first load. Uses the native dialog for focus handling and Escape. */
export function ContentNote() {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !readSeen() && !dialog.open) dialog.showModal();
  }, []);

  const close = () => {
    writeSeen();
    dialogRef.current?.close();
  };

  return (
    <dialog ref={dialogRef} className="content-note" aria-labelledby="content-note-title" onClose={writeSeen}>
      <h2 id="content-note-title">Content note</h2>
      <p>
        This project is about racial violence and exclusion in Texas and the United States. The sources it
        draws on describe threats, expulsions, and segregation. Quoted language in those sources has been
        paraphrased here, and links go to the original pages.
      </p>
      <button type="button" onClick={close} autoFocus>
        Continue to the map
      </button>
    </dialog>
  );
}
