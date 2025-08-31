import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@shared/schema";

export default function NotesSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedNoteType, setSelectedNoteType] = useState("");
  const { toast } = useToast();

  // Build query string for API call
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedClass) params.set('class', selectedClass);
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedNoteType) params.set('noteType', selectedNoteType);
    return params.toString();
  };

  const queryString = buildQueryString();
  const apiUrl = queryString ? `/api/notes?${queryString}` : '/api/notes';

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: [apiUrl],
  });

  const handleGetNotes = (driveLink: string, title: string) => {
    if (driveLink) {
      window.open(driveLink, "_blank");
      toast({
        title: "Opening Notes",
        description: `Opening ${title} in a new tab`,
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedNoteType("");
  };

  const getBadgeVariant = (noteType: string) => {
    switch (noteType) {
      case "premium":
        return "default";
      case "one_pager":
        return "secondary";
      case "animated":
        return "destructive";
      case "typed":
        return "outline";
      default:
        return "default";
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

  return (
    <section className="py-16 bg-card" id="subjects">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl font-bold mb-4 gradient-text">Find Your Perfect Notes</h2>
          <p className="text-lg text-muted-foreground">Search through our comprehensive collection of study materials</p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 animate-slide-up">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for notes, subjects, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 text-lg py-4"
              data-testid="input-search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          </div>
        </div>
        
        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger data-testid="select-class">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Class 9">Class 9</SelectItem>
              <SelectItem value="Class 10">Class 10</SelectItem>
              <SelectItem value="Class 11">Class 11</SelectItem>
              <SelectItem value="Class 12">Class 12</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger data-testid="select-subject">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="History">History</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedNoteType} onValueChange={setSelectedNoteType}>
            <SelectTrigger data-testid="select-note-type">
              <SelectValue placeholder="Note Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="premium">Premium Notes</SelectItem>
              <SelectItem value="one_pager">One Pager</SelectItem>
              <SelectItem value="animated">Animated</SelectItem>
              <SelectItem value="typed">Typed Notes</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={clearFilters}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            data-testid="button-clear-filters"
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading notes...</p>
          </div>
        )}
        
        {/* Note Results Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {notes.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground text-lg">No notes found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
              </div>
            ) : (
              notes.map((note) => (
                <Card key={note.id} className="hover-lift" data-testid={`card-note-${note.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary" data-testid={`badge-class-${note.id}`}>
                        {note.class}
                      </Badge>
                      <Badge variant={getBadgeVariant(note.noteType)} data-testid={`badge-type-${note.id}`}>
                        {formatNoteType(note.noteType)}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-2" data-testid={`text-title-${note.id}`}>
                      {note.title}
                    </h3>
                    <p className="text-muted-foreground mb-4" data-testid={`text-description-${note.id}`}>
                      {note.description || "No description available"}
                    </p>
                    <Button
                      onClick={() => handleGetNotes(note.driveLink, note.title)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid={`button-get-notes-${note.id}`}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Get Notes
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
