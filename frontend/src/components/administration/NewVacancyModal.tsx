import { useState } from "react";
import { X, Save, Briefcase, Building2, FileText } from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import { useCreateVacancy } from "@/hooks/useAppQueries";

const FACULTIES = [
  "Engineering",
  "Life Sciences",
  "Law",
  "Economics",
  "Arts",
  "Mathematics",
  "Administrative Sciences",
  "Medicine",
];

interface NewVacancyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewVacancyModal({ open, onClose, onCreated }: NewVacancyModalProps) {
  const [title, setTitle] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createVacancyMutation = useCreateVacancy();

  if (!open) return null;

  const handleSave = async () => {
    if (!title.trim() || !faculty.trim()) {
      setError("Title and Faculty are required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await createVacancyMutation.mutateAsync({
        title: title.trim(),
        faculty,
        department: department.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
      });
      onCreated();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error creating the vacancy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-3xl p-0 overflow-hidden">
        <div className="flex justify-between items-center border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold">New Vacancy</h2>
            <p className="text-sm text-slate-500 mt-1">
              Fill in the information to publish a new vacancy.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Position *</label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="AI Professor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Faculty *</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Select...</option>
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <input
                type="text"
                placeholder="Computer Systems Program"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Requirements</label>
            <textarea
              rows={3}
              placeholder="Postgraduate degree, 3 years of teaching experience..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-4 text-slate-400" />
              <textarea
                rows={4}
                placeholder="Describe the required profile and the responsibilities of the position..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg pl-10 pr-4 py-3 resize-none focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="border-t px-6 py-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            onClick={handleSave}
            isLoading={isSubmitting}
          >
            <Save size={18} />
            Save Vacancy
          </Button>
        </div>
      </Card>
    </div>
  );
}
