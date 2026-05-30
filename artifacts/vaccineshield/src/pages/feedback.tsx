import { useState } from "react";
import { store, Feedback } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { MessageSquare, Star, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`transition-transform ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star className={`h-5 w-5 ${star <= value ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

const FIELD_STORIES = [
  { name: "Dr. Amara Osei", role: "District Health Officer", rating: 5, comment: "VaccineShield Pro has transformed our immunization tracking. We now have real-time visibility into vaccine stock across all 12 facilities. Coverage rates have improved by 18% this quarter.", avatar: "A" },
  { name: "Nurse Fatima Al-Hassan", role: "Vaccination Nurse, UC-3", rating: 5, comment: "The patient intake POS is incredibly fast. I can register a child and record their vaccination in under 2 minutes. The SMS reminders have significantly reduced missed doses.", avatar: "F" },
  { name: "James K. Supervisor", role: "Regional Supervisor", rating: 4, comment: "The cold chain monitoring alerts saved us from a potential refrigerator failure. The automated warning at 9°C gave us 2 hours to transfer vaccines before any spoilage occurred.", avatar: "J" },
  { name: "Sara Mensah", role: "Health Worker, Field Team", rating: 5, comment: "Working offline is seamless. Even without internet in remote areas, I can record vaccinations and they sync when I return to the health center. Highly recommended.", avatar: "S" },
];

const RADAR_DATA = [
  { subject: "Ease of Use", A: 90 }, { subject: "Speed", A: 85 }, { subject: "Reliability", A: 92 },
  { subject: "Reporting", A: 88 }, { subject: "Support", A: 78 }, { subject: "Features", A: 95 },
];

const RATING_DIST = [
  { stars: "5 stars", count: 18 }, { stars: "4 stars", count: 9 }, { stars: "3 stars", count: 3 },
  { stars: "2 stars", count: 1 }, { stars: "1 star", count: 0 },
];

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState(store.getFeedback());
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [form, setForm] = useState({ workerName: "", rating: 5, comment: "" });
  const [submitted, setSubmitted] = useState(false);

  const allFeedback = [...FIELD_STORIES, ...feedbacks.map(f => ({
    name: f.workerName, role: "Health Worker", rating: f.rating, comment: f.comment, avatar: f.workerName.charAt(0)
  }))];

  const avgRating = (allFeedback.reduce((a, f) => a + f.rating, 0) / allFeedback.length).toFixed(1);
  const satisfactionPct = Math.round((allFeedback.filter(f => f.rating >= 4).length / allFeedback.length) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fb: Feedback = { id: `f${Date.now()}`, ...form, timestamp: new Date().toISOString() };
    store.saveFeedback(fb);
    setFeedbacks(store.getFeedback());
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ workerName: "", rating: 5, comment: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Field Feedback</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Reviews from health workers and field teams</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{avgRating}</div>
            <div>
              <StarRating value={Math.round(Number(avgRating))} />
              <p className="text-xs text-muted-foreground mt-1">Average rating</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{satisfactionPct}%</p>
              <p className="text-xs text-muted-foreground">Satisfaction Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{allFeedback.length}</p>
              <p className="text-xs text-muted-foreground">Total Reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carousel */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Field Success Stories</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCarouselIdx(i => Math.max(0, i - 1))} disabled={carouselIdx === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">{carouselIdx + 1} / {allFeedback.length}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCarouselIdx(i => Math.min(allFeedback.length - 1, i + 1))} disabled={carouselIdx >= allFeedback.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allFeedback[carouselIdx] && (
            <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {allFeedback[carouselIdx].avatar || allFeedback[carouselIdx].name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{allFeedback[carouselIdx].name}</p>
                    <p className="text-xs text-muted-foreground">{allFeedback[carouselIdx].role}</p>
                  </div>
                  <StarRating value={allFeedback[carouselIdx].rating} />
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{allFeedback[carouselIdx].comment}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Rating Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={RATING_DIST} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="stars" tick={{ fontSize: 11 }} width={55} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="count" fill="hsl(221,83%,53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Performance Radar</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar dataKey="A" stroke="hsl(221,83%,53%)" fill="hsl(221,83%,53%)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Submit Feedback</CardTitle></CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-6 text-emerald-500 gap-2">
                <MessageSquare className="h-8 w-8" />
                <p className="text-sm font-medium">Thank you for your feedback!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label className="text-xs">Your Name</Label>
                  <Input value={form.workerName} onChange={e => setForm({ ...form, workerName: e.target.value })} required data-testid="input-feedback-name" />
                </div>
                <div>
                  <Label className="text-xs">Rating</Label>
                  <StarRating value={form.rating} onChange={r => setForm({ ...form, rating: r })} />
                </div>
                <div>
                  <Label className="text-xs">Comment</Label>
                  <Textarea rows={3} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} required data-testid="textarea-feedback-comment" />
                </div>
                <Button type="submit" size="sm" className="w-full" data-testid="button-submit-feedback">Submit</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
