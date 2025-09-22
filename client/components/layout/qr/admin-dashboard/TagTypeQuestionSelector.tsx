"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRTagType, QRTagQuestion } from "@/types/newQRType.types";
import { getQuestionsForTagType, getTagTypeDisplayName } from "@/common/constants/qrTagTypes";
import { toast } from "sonner";

interface TagTypeQuestionSelectorProps {
  selectedTagType: QRTagType | null;
  selectedQuestions: QRTagQuestion[];
  onTagTypeChange: (tagType: QRTagType | null) => void;
  onQuestionsChange: (questions: QRTagQuestion[]) => void;
}

export default function TagTypeQuestionSelector({
  selectedTagType,
  selectedQuestions,
  onTagTypeChange,
  onQuestionsChange,
}: TagTypeQuestionSelectorProps) {
  const [availableQuestions, setAvailableQuestions] = useState<QRTagQuestion[]>([]);

  useEffect(() => {
    if (selectedTagType) {
      const questions = getQuestionsForTagType(selectedTagType);
      setAvailableQuestions(questions);
      // Reset selected questions when tag type changes
      onQuestionsChange([]);
    } else {
      setAvailableQuestions([]);
      onQuestionsChange([]);
    }
  }, [selectedTagType, onQuestionsChange]);

  const handleQuestionToggle = (question: QRTagQuestion, checked: boolean) => {
    if (checked) {
      onQuestionsChange([...selectedQuestions, question]);
    } else {
      onQuestionsChange(selectedQuestions.filter(q => q.id !== question.id));
    }
  };

  const handleSelectAll = () => {
    onQuestionsChange(availableQuestions);
    toast.success(`Selected all ${availableQuestions.length} questions`);
  };

  const handleDeselectAll = () => {
    onQuestionsChange([]);
    toast.success("Deselected all questions");
  };

  const isQuestionSelected = (questionId: string) => {
    return selectedQuestions.some(q => q.id === questionId);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      safety: "bg-green-100 text-green-800",
      emergency: "bg-red-100 text-red-800",
      security: "bg-blue-100 text-blue-800",
      violation: "bg-orange-100 text-orange-800",
      damage: "bg-yellow-100 text-yellow-800",
      lost: "bg-purple-100 text-purple-800",
      medical: "bg-pink-100 text-pink-800",
      behavior: "bg-indigo-100 text-indigo-800",
      mechanical: "bg-gray-100 text-gray-800",
      accident: "bg-red-100 text-red-800",
      inconvenience: "bg-yellow-100 text-yellow-800",
      travel: "bg-cyan-100 text-cyan-800",
      identification: "bg-emerald-100 text-emerald-800",
      forgotten: "bg-amber-100 text-amber-800",
      return: "bg-lime-100 text-lime-800",
      mistake: "bg-rose-100 text-rose-800",
      pickup: "bg-violet-100 text-violet-800",
      technical: "bg-slate-100 text-slate-800",
      location: "bg-teal-100 text-teal-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tag Type & Questions Configuration</CardTitle>
        <CardDescription>
          Select a tag type and choose the questions that will be shown when someone scans the QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tag Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="tagType">Tag Type</Label>
          <Select
            value={selectedTagType || ""}
            onValueChange={(value) => onTagTypeChange(value as QRTagType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a tag type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(QRTagType).map((tagType) => (
                <SelectItem key={tagType} value={tagType}>
                  {getTagTypeDisplayName(tagType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Questions Selection */}
        {selectedTagType && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Available Questions ({availableQuestions.length})</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={availableQuestions.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedQuestions.length === 0}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            {availableQuestions.length > 0 ? (
              <div className="grid gap-3 max-h-96 overflow-y-auto border rounded-md p-4">
                {availableQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-200"
                  >
                    <Checkbox
                    className="bg-gray-200"
                      id={question.id}
                      checked={isQuestionSelected(question.id)}
                      onCheckedChange={(checked) =>
                        handleQuestionToggle(question, checked as boolean)
                      }
                    />
                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor={question.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {question.text}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getCategoryColor(question.category)}`}
                        >
                          {question.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No questions available for this tag type
              </div>
            )}

            {/* Selected Questions Summary */}
            {selectedQuestions.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Questions ({selectedQuestions.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedQuestions.map((question) => (
                    <Badge
                      key={question.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {question.text.length > 30
                        ? `${question.text.substring(0, 30)}...`
                        : question.text}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
