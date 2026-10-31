import {
  createContext,
  createPortal,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import "./design-system.css";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`ds-button ds-button-${variant} ${className}`.trim()} type={type} {...props} />;
}

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ds-card ${className}`.trim()} {...props}>{children}</div>;
}

export function Input({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId, props["aria-describedby"]].filter(Boolean).join(" ") || undefined;

  return <label className="ds-field" htmlFor={inputId}>
    <span className="ds-field-label">{label}</span>
    <input
      {...props}
      id={inputId}
      className={`ds-input ${error ? "ds-input-error" : ""} ${className}`.trim()}
      aria-invalid={error ? true : props["aria-invalid"]}
      aria-describedby={describedBy}
    />
    {hint && <small className="ds-field-hint" id={hintId}>{hint}</small>}
    {error && <small className="ds-field-error" id={errorId}>{error}</small>}
  </label>;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  labelledBy,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = () => dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable()?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items?.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="ds-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div
        ref={dialogRef}
        className="ds-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? titleId}
        tabIndex={-1}
      >
        <div className="ds-modal-heading">
          <h2 id={labelledBy ?? titleId}>{title}</h2>
          <Button variant="quiet" aria-label="Close dialog" onClick={onClose}>×</Button>
        </div>
        <div className="ds-modal-content">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ tabs, defaultValue }: { tabs: TabItem[]; defaultValue?: string }) {
  const baseId = useId();
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.id ?? "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentIndex = tabs.findIndex((tab) => tab.id === active);
  const current = tabs[currentIndex] ?? tabs[0];

  const focusTab = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  if (!tabs.length) return null;
  return <div className="ds-tabs">
    <div className="ds-tab-list" role="tablist" aria-label="Content sections">
      {tabs.map((tab, index) => <button
        key={tab.id}
        ref={(element) => { tabRefs.current[index] = element; }}
        id={`${baseId}-tab-${tab.id}`}
        className={`ds-tab ${tab.id === current?.id ? "is-active" : ""}`}
        type="button"
        role="tab"
        aria-selected={tab.id === current?.id}
        aria-controls={`${baseId}-panel-${tab.id}`}
        tabIndex={tab.id === current?.id ? 0 : -1}
        onClick={() => setActive(tab.id)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") focusTab(index + 1);
          if (event.key === "ArrowLeft") focusTab(index - 1);
          if (event.key === "Home") focusTab(0);
          if (event.key === "End") focusTab(tabs.length - 1);
        }}
      >{tab.label}</button>)}
    </div>
    {current && <div
      id={`${baseId}-panel-${current.id}`}
      className="ds-tab-panel"
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${current.id}`}
      tabIndex={0}
    >{current.content}</div>}
  </div>;
}

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  const id = useId();
  return <span className="ds-tooltip-wrap">
    <span className="ds-tooltip-trigger" tabIndex={0} aria-describedby={id}>{children}</span>
    <span className="ds-tooltip-content" id={id} role="tooltip">{text}</span>
  </span>;
}

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={`ds-skeleton ${className}`.trim()} {...props} />;
}

export function EmptyState({
  title,
  description,
  action,
  className = "",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return <section className={`ds-empty-state ${className}`.trim()}>
    <h3>{title}</h3>
    <p>{description}</p>
    {action && <div className="ds-empty-action">{action}</div>}
  </section>;
}

export function ProgressRing({
  value,
  size = 112,
  strokeWidth = 9,
  label = "Progress",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const normalized = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalized / 100);

  return <svg
    className="ds-progress-ring"
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    role="img"
    aria-label={`${label}: ${Math.round(normalized)}%`}
  >
    <circle className="ds-progress-track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} />
    <circle
      className="ds-progress-value"
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      strokeWidth={strokeWidth}
      strokeDasharray={circumference}
      strokeDashoffset={dashOffset}
      strokeLinecap="round"
      transform={`rotate(-90 ${size / 2} ${size / 2})`}
    />
    <text className="ds-progress-label" x="50%" y="50%" dominantBaseline="central" textAnchor="middle">{Math.round(normalized)}%</text>
  </svg>;
}

export function StatCard({
  label,
  value,
  description,
  icon,
  className = "",
}: {
  label: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return <Card className={`ds-stat-card ${className}`.trim()}>
    {icon && <span className="ds-stat-icon" aria-hidden="true">{icon}</span>}
    <span className="ds-stat-label">{label}</span>
    <strong className="ds-stat-value">{value}</strong>
    {description && <span className="ds-stat-description">{description}</span>}
  </Card>;
}

type ToastKind = "success" | "info" | "error";
interface ToastMessage {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = (id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setMessages((current) => current.filter((message) => message.id !== id));
  };

  const showToast = (message: string, kind: ToastKind = "info", duration = 5000) => {
    const id = ++nextId.current;
    setMessages((current) => [...current, { id, kind, message }]);
    if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
  };

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  }, []);

  return <ToastContext.Provider value={{ showToast }}>
    {children}
    <div className="ds-toast-stack" aria-live="polite" aria-relevant="additions text">
      {messages.map(({ id, kind, message }) => <div key={id} className={`ds-toast ds-toast-${kind}`} role={kind === "error" ? "alert" : "status"}>
        <span>{message}</span>
        <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(id)}>×</button>
      </div>)}
    </div>
  </ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
