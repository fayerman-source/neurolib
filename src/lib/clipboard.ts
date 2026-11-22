export interface ClipboardEnvironment {
  clipboard?: {
    writeText?: (text: string) => Promise<void>;
  };
  document?: {
    createElement: (tag: 'textarea') => {
      value: string;
      setAttribute: (name: string, value: string) => void;
      style: {
        position: string;
        top: string;
        left: string;
        opacity: string;
      };
      focus: () => void;
      select: () => void;
    };
    body: {
      appendChild: (node: unknown) => unknown;
      removeChild: (node: unknown) => unknown;
    };
    execCommand?: (commandId: string) => boolean;
  };
}

export async function copyTextToClipboard(
  text: string,
  env?: ClipboardEnvironment
): Promise<boolean> {
  const activeClipboard =
    env !== undefined
      ? env.clipboard
      : typeof navigator !== 'undefined'
        ? navigator.clipboard
        : undefined;

  if (activeClipboard && typeof activeClipboard.writeText === 'function') {
    try {
      await activeClipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy textarea copy path
    }
  }

  const activeDoc =
    env !== undefined
      ? env.document
      : typeof document !== 'undefined'
        ? (document as unknown as ClipboardEnvironment['document'])
        : undefined;

  if (!activeDoc || !activeDoc.body || typeof activeDoc.execCommand !== 'function') {
    return false;
  }

  const textarea = activeDoc.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';

  activeDoc.body.appendChild(textarea);
  try {
    textarea.focus();
    textarea.select();
    return Boolean(activeDoc.execCommand('copy'));
  } catch {
    return false;
  } finally {
    activeDoc.body.removeChild(textarea);
  }
}
