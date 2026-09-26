import { AlertCircle, Clock, CheckCircle2, PlayCircle, PauseCircle, XCircle } from 'lucide-react';

export default function ModelStatus({ status }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'Not Trained':
        return { color: 'text-orange-700', bg: 'bg-orange-50', ring: 'ring-orange-600/20', Icon: AlertCircle };
      case 'Training':
        return { color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-600/20', Icon: Clock };
      case 'Ready':
        return { color: 'text-teal-700', bg: 'bg-teal-50', ring: 'ring-teal-600/20', Icon: CheckCircle2 };
      case 'Active':
        return { color: 'text-green-700', bg: 'bg-green-50', ring: 'ring-green-600/20', Icon: PlayCircle };
      case 'Inactive':
        return { color: 'text-slate-700', bg: 'bg-slate-50', ring: 'ring-slate-600/20', Icon: PauseCircle };
      case 'Failed':
        return { color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-600/20', Icon: XCircle };
      default:
        return { color: 'text-slate-700', bg: 'bg-slate-50', ring: 'ring-slate-600/20', Icon: AlertCircle };
    }
  };

  const { color, bg, ring, Icon } = getStatusConfig();

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${bg} ${color} ${ring} gap-1.5`}>
      <Icon size={14} />
      {status}
    </span>
  );
}
