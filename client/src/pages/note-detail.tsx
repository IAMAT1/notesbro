import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@shared/schema";

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: note, isLoading, error } = useQuery<Note>({
    queryKey: ["/api/notes", id],
    enabled: !!id,
  });

  const handleGetNotes = () => {
    if (note?.driveLink) {
      window.open(note.driveLink, "_blank");
      toast({
        title: "Opening Notes",
        description: `Opening ${note.title} in a new tab`,
      });
    }
  };

  const formatNoteType = (noteType: string) => {
    switch (noteType) {
      case "one_pager":
        return "One Pager";
      case "animated":
        return "Animated";
      case "typed":
        return "Typed";
      case "premium":
        return "Premium";
      default:
        return noteType;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-32 bg-muted rounded w-full"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">Note Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The note you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")} 
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notes
        </Button>

        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary" data-testid="badge-class">
                    {note.class}
                  </Badge>
                  <Badge variant="secondary" data-testid="badge-subject">
                    {note.subject}
                  </Badge>
                  <Badge data-testid="badge-type">
                    {formatNoteType(note.noteType)}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold gradient-text mb-2" data-testid="text-title">
                  {note.title}
                </CardTitle>
                {note.createdAt && (
                  <p className="text-sm text-muted-foreground">
                    Added on {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {note.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                  {note.description}
                </p>
              </div>
            )}

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Ready to Study?</h3>
              <p className="text-muted-foreground mb-4">
                Click the button below to access your study materials. The notes will open in a new tab for easy reference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGetNotes}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
                  data-testid="button-get-notes"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Get Notes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGetNotes}
                  className="flex-1"
                  data-testid="button-view-online"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Online
                </Button>
              </div>
            </div>

            {/* Study Tips */}
            <div className="bg-accent/10 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-accent-foreground">📚 Study Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Review the notes multiple times for better retention</li>
                <li>• Make your own summary notes while studying</li>
                <li>• Practice with examples and solve related problems</li>
                <li>• Join study groups to discuss complex topics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
