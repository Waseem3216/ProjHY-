import { CheckCircle2, CircleHelp, MapPin, Siren } from 'lucide-react';
const urgencyTone={Low:'border-gray-200 bg-gray-50 text-gray-700',Normal:'border-blue-200 bg-blue-50 text-blue-700',Soon:'border-amber-200 bg-amber-50 text-amber-800',Urgent:'border-rose-200 bg-rose-50 text-rose-700'};
function Badge({children,className='',icon:Icon}){return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{Icon?<Icon className="h-3.5 w-3.5"/>:null}{children}</span>}
export function CategoryBadge({category}){return <Badge icon={CircleHelp} className="border-gray-200 bg-gray-50 text-gray-700">{category}</Badge>}
export function AreaBadge({area}){return <Badge icon={MapPin} className="border-gray-200 bg-white text-gray-600">{area}</Badge>}
export function UrgencyBadge({urgency}){return <Badge icon={Siren} className={urgencyTone[urgency]||urgencyTone.Normal}>{urgency}</Badge>}
export function SolvedBadge({solved}){return solved?<Badge icon={CheckCircle2} className="border-emerald-200 bg-emerald-50 text-emerald-700">Solved</Badge>:<Badge className="border-gray-200 bg-gray-50 text-gray-600">Open</Badge>}
export function TagPill({tag}){return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">#{tag}</span>}
