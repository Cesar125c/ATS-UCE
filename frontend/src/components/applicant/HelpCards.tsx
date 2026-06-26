import {
  LifeBuoy,
  MessageCircle,
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function HelpCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

      <Card className="bg-slate-900 text-white p-6">

        <div className="flex justify-between items-center">

          <div className="flex gap-4">

            <LifeBuoy size={26}/>

            <div>

              <h3 className="font-semibold">
                Centro de Ayuda
              </h3>

              <p className="text-sm text-slate-300 mt-1">
                Resuelve dudas sobre el proceso
                de postulación y el análisis IA.
              </p>

            </div>

          </div>

          <Button className="bg-red-600 hover:bg-red-700">
            Ir Ahora
          </Button>

        </div>

      </Card>

      <Card className="bg-sky-50 border-sky-200 p-6">

        <div className="flex justify-between items-center">

          <div className="flex gap-4">

            <MessageCircle
              size={26}
              className="text-sky-600"
            />

            <div>

              <h3 className="font-semibold">
                ¿Necesitas soporte?
              </h3>

              <p className="text-sm text-slate-600 mt-1">
                Contacta con nuestro equipo
                para problemas con la carga
                de archivos.
              </p>

            </div>

          </div>

          <Button className="bg-red-600 hover:bg-red-700">
            Contacto
          </Button>

        </div>

      </Card>

    </div>
  );
}