import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function StiServiceCard({ service, selected, onSelect }: any) {
  return (
    <div
      className={`rounded-2xl shadow-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${
        selected ? "border-primary ring-2 ring-primary/30" : "border-gray-100"
      }`}
      onClick={onSelect}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900">
            {service.name}
          </h3>
          <Badge variant="secondary">STI</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-4 min-h-[40px]">
          {service.description}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-primary font-bold text-lg">
            {service.price?.toLocaleString()}đ
          </span>
          <Button
            size="sm"
            variant={selected ? "default" : "outline"}
            className={`rounded-full px-4 flex items-center gap-2 ${selected ? "bg-primary text-white" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {selected ? <CheckCircle2 className="w-5 h-5 mr-1" /> : null}
            {selected ? "Đã chọn" : "Chọn"}
          </Button>
        </div>
      </div>
    </div>
  );
}
