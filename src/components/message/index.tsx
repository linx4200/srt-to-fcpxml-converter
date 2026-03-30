import { useEffect, useState, type ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { CheckCircle2, CircleAlert, Info } from 'lucide-react';

export type MessageType = 'info' | 'success' | 'error';

type MessageContent = ReactNode;

type MessageConfig = {
  content: MessageContent;
  duration?: number;
};

type MessageOptions = MessageContent | MessageConfig;

type MessageRecord = {
  id: number;
  content: MessageContent;
  duration: number;
  type: MessageType;
};

const DEFAULT_DURATION = 3000;

let seed = 0;
let root: Root | null = null;
let container: HTMLDivElement | null = null;
let queue: MessageRecord[] = [];

function renderMessages() {
  if (typeof document === 'undefined') return;

  if (!container) {
    container = document.createElement('div');
    container.id = 'global-message-root';
    document.body.appendChild(container);
    root = createRoot(container);
  }

  root?.render(
    <MessageViewport
      messages={queue}
      onClose={(id) => {
        queue = queue.filter((message) => message.id !== id);
        renderMessages();
      }}
    />,
  );
}

function normalizeOptions(
  type: MessageType,
  options: MessageOptions,
  duration?: number,
): MessageRecord {
  if (isMessageConfig(options)) {
    return {
      id: seed++,
      content: options.content,
      duration: options.duration ?? duration ?? DEFAULT_DURATION,
      type,
    };
  }

  return {
    id: seed++,
    content: options,
    duration: duration ?? DEFAULT_DURATION,
    type,
  };
}

function isMessageConfig(options: MessageOptions): options is MessageConfig {
  return (
    typeof options === 'object' &&
    options !== null &&
    !Array.isArray(options) &&
    'content' in options
  );
}

function openMessage(
  type: MessageType,
  options: MessageOptions,
  duration?: number,
) {
  const message = normalizeOptions(type, options, duration);
  queue = [...queue, message];
  renderMessages();

  return () => {
    queue = queue.filter((item) => item.id !== message.id);
    renderMessages();
  };
}

function destroyAll() {
  queue = [];
  renderMessages();
}

function MessageViewport({
  messages,
  onClose,
}: {
  messages: MessageRecord[];
  onClose: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-1000 flex flex-col items-center gap-3 px-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onClose={() => onClose(message.id)}
        />
      ))}
    </div>
  );
}

function MessageItem({
  message,
  onClose,
}: {
  message: MessageRecord;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterTimer = window.setTimeout(() => setVisible(true), 10);
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onClose, 180);
    }, message.duration);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(timer);
    };
  }, [message.duration, onClose]);

  const variants: Record<
    MessageType,
    { icon: typeof Info; className: string }
  > = {
    info: {
      icon: Info,
      className:
        'border-sky-400/30 bg-sky-500/12 text-sky-100 shadow-[0_16px_40px_rgba(14,165,233,0.18)]',
    },
    success: {
      icon: CheckCircle2,
      className:
        'border-emerald-400/30 bg-emerald-500/12 text-emerald-100 shadow-[0_16px_40px_rgba(16,185,129,0.18)]',
    },
    error: {
      icon: CircleAlert,
      className:
        'border-rose-400/30 bg-rose-500/12 text-rose-100 shadow-[0_16px_40px_rgba(244,63,94,0.18)]',
    },
  };

  const { icon: Icon, className } = variants[message.type];

  return (
    <div
      className={`pointer-events-auto flex min-w-[260px] max-w-[min(560px,calc(100vw-2rem))] items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={18} className="shrink-0" />
      <div className="text-sm font-medium leading-6">{message.content}</div>
    </div>
  );
}

export const message = {
  info(options: MessageOptions, duration?: number) {
    return openMessage('info', options, duration);
  },
  success(options: MessageOptions, duration?: number) {
    return openMessage('success', options, duration);
  },
  error(options: MessageOptions, duration?: number) {
    return openMessage('error', options, duration);
  },
  destroy: destroyAll,
};
