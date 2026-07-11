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
                Help Center
              </h3>

              <p className="text-sm text-slate-300 mt-1">
                Get answers about the application
                process and the AI analysis.
              </p>

            </div>

          </div>

          <Button
            variant="danger"
            onClick={() => window.open("https://help.uce.edu.ec", "_blank")}
          >
            Go Now
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
                Need support?
              </h3>

              <p className="text-sm text-slate-600 mt-1">
                Contact our team
                for issues with file
                uploads.
              </p>

            </div>

          </div>

          <Button
            variant="danger"
            onClick={() => window.location.href = "mailto:support@uce.edu.ec"}
          >
            Contact
          </Button>

        </div>

      </Card>

    </div>
  );
}
