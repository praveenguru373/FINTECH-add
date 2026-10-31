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
