export default function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-slate-400">
      {message}
    </div>
  );
}
