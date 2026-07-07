export default function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
      {message}
    </div>
  );
}
