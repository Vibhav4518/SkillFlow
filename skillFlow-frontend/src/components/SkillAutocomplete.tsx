"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, X, Check, Code2 } from "lucide-react";

interface SkillAutocompleteProps {
  selectedSkills: string[];
  onAddSkill: (skillName: string) => void;
  onRemoveSkill: (skillName: string) => void;
  placeholder?: string;
}

const FALLBACK_SKILLS = [
  "Java", "JavaScript", "TypeScript", "Python", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "Dart", "Scala",
  "HTML", "CSS", "React", "Next.js", "Angular", "Vue.js", "Redux", "Tailwind CSS", "Bootstrap", "Material UI",
  "Node.js", "Express.js", "Spring Boot", "Django", "Flask", "FastAPI", ".NET", "Laravel", "REST API", "GraphQL", "Microservices",
  "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server", "Elasticsearch", "Firebase",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "Ansible", "CI/CD", "Linux", "Nginx",
  "Machine Learning", "Deep Learning", "Artificial Intelligence", "Data Science", "Data Analysis", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Generative AI", "LLM", "OpenCV",
  "Android", "Android Studio", "Flutter", "React Native", "iOS",
  "Manual Testing", "Selenium", "Cypress", "Playwright", "Jest", "JUnit", "Postman", "API Testing", "Unit Testing", "Integration Testing",
  "Cybersecurity", "Network Security", "Ethical Hacking", "Penetration Testing", "OWASP", "Cryptography", "IAM",
  "UI/UX", "Figma", "Adobe XD", "Photoshop", "Product Design", "Wireframing", "Prototyping",
  "Communication", "Leadership", "Problem Solving", "Teamwork", "Project Management", "Agile", "Scrum", "Critical Thinking", "Time Management"
];

export default function SkillAutocomplete({
  selectedSkills = [],
  onAddSkill,
  onRemoveSkill,
  placeholder = "Search or type a skill (e.g. Java, Python, React)...",
}: SkillAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>(FALLBACK_SKILLS);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/skills");
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = res.data.map((s: any) => typeof s === "string" ? s : s.name);
          // Combine fetched skills with fallback, keeping uniques
          const combined = Array.from(new Set([...names, ...FALLBACK_SKILLS]));
          setAvailableSkills(combined);
        }
      } catch {
        // Fallback initialized
      }
    })();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter skills based on user input
  const filteredSuggestions = query.trim()
    ? availableSkills.filter((s) => {
        const matchesQuery = s.toLowerCase().includes(query.toLowerCase());
        const isNotSelected = !selectedSkills.some((sel) => sel.toLowerCase() === s.toLowerCase());
        return matchesQuery && isNotSelected;
      }).slice(0, 10)
    : availableSkills.filter((s) => !selectedSkills.some((sel) => sel.toLowerCase() === s.toLowerCase())).slice(0, 8);

  const handleSelect = (skillName: string) => {
    if (!skillName.trim()) return;
    onAddSkill(skillName.trim());
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        handleSelect(filteredSuggestions[0]);
      } else if (query.trim()) {
        handleSelect(query.trim());
      }
    }
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {/* Selected Skill Chips */}
      <div className="flex flex-wrap gap-2">
        {selectedSkills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 px-3 py-1 text-xs font-bold shadow-xs transition hover:bg-indigo-500/20"
          >
            <Code2 className="h-3.5 w-3.5 text-indigo-500" />
            {skill}
            <button
              type="button"
              onClick={() => onRemoveSkill(skill)}
              className="ml-0.5 text-slate-400 hover:text-red-500 transition"
              title={`Remove ${skill}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>

      {/* Autocomplete Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full rounded-2xl border px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            style={{
              backgroundColor: "var(--color-bg-input)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
          {query.trim() && (
            <button
              type="button"
              onClick={() => handleSelect(query)}
              className="shrink-0 inline-flex items-center gap-1 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl text-xs space-y-0.5">
            {filteredSuggestions.map((skill, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(skill)}
                className="flex items-center justify-between rounded-xl px-3.5 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white cursor-pointer transition"
              >
                <span className="font-semibold">{skill}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white">+ Add</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
