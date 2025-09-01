import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Note, InsertNote } from "@shared/schema";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogin: (username: string, password: string) => void;
  onLogout?: () => void;
}

export default function AdminPanel({ isOpen, onClose, isLoggedIn, onLogin, onLogout }: AdminPanelProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedSubDomain, setSelectedSubDomain] = useState("");
  const [newNote, setNewNote] = useState<Partial<InsertNote>>({
    title: "",
    description: "",
    class: "",
    subject: "",
    noteType: "",
    driveLink: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sub-domains for Science and Social Science
  const subDomains = {
    "Science": ["Physics", "Chemistry", "Biology"],
    "Social Science": ["History", "Political Science", "Economics", "Geography"]
  };

  // Get available sub-domains based on selected subject
  const getAvailableSubDomains = () => {
    if (!newNote.subject || !(newNote.subject in subDomains)) return [];
    return subDomains[newNote.subject as keyof typeof subDomains] || [];
  };

  // Reset sub-domain when subject changes
  const handleSubjectChange = (subject: string) => {
    setNewNote(prev => ({ ...prev, subject }));
    setSelectedSubDomain(""); // Reset sub-domain when subject changes
  };

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    enabled: isLoggedIn,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: InsertNote) => {
      const response = await apiRequest("POST", "/api/notes", noteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setNewNote({
        title: "",
        description: "",
        class: "",
        subject: "",
        noteType: "",
        driveLink: ""
      });
      toast({
        title: "Success",
        description: "Note created successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Create note error:", error);
      let errorMessage = "Failed to create note. Please try again.";
      if (error?.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await apiRequest("DELETE", `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleLogin = () => {
    onLogin(username, password);
    setUsername("");
    setPassword("");
  };

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.class || !newNote.subject || !newNote.noteType || !newNote.driveLink) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createNoteMutation.mutate(newNote as InsertNote);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      }
      await apiRequest("POST", "/api/auth/logout");
      onClose(); // This will reset the login state
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was an issue logging out.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card p-4 sm:p-8 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-primary break-words">Admin Dashboard</h2>
          <div className="flex gap-2">
            {isLoggedIn && (
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Logout
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} data-testid="button-close-admin">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {!isLoggedIn ? (
          <div className="space-y-4" data-testid="admin-login-form">
            <div>
              <Label htmlFor="admin-username">Admin Username</Label>
              <Input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                data-testid="input-admin-username"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                data-testid="input-admin-password"
              />
            </div>
            <Button onClick={handleLogin} className="w-full" data-testid="button-admin-login">
              Login
            </Button>
          </div>
        ) : (
          <div className="space-y-6" data-testid="admin-dashboard">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-primary mb-2">Total Notes</h3>
                  <p className="text-2xl font-bold" data-testid="stat-total-notes">{notes.length}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Add New Note Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Note
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="note-title">Title *</Label>
                    <Input
                      id="note-title"
                      value={newNote.title || ""}
                      onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Note title"
                      data-testid="input-note-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-drive-link">Google Drive Link *</Label>
                    <Input
                      id="note-drive-link"
                      value={newNote.driveLink || ""}
                      onChange={(e) => setNewNote(prev => ({ ...prev, driveLink: e.target.value }))}
                      placeholder="https://drive.google.com/..."
                      data-testid="input-drive-link"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="note-description">Description</Label>
                  <Textarea
                    id="note-description"
                    value={newNote.description || ""}
                    onChange={(e) => setNewNote(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Note description"
                    data-testid="textarea-description"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Class *</Label>
                    <Select value={newNote.class} onValueChange={(value) => setNewNote(prev => ({ ...prev, class: value }))}>
                      <SelectTrigger data-testid="select-note-class">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Class 9">Class 9</SelectItem>
                        <SelectItem value="Class 10">Class 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Subject *</Label>
                    <Select value={newNote.subject} onValueChange={handleSubjectChange}>
                      <SelectTrigger data-testid="select-note-subject">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Social Science">Social Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Sub-domain dropdown - appears when Science or Social Science is selected */}
                  {getAvailableSubDomains().length > 0 && (
                    <div>
                      <Label>Domain *</Label>
                      <Select value={selectedSubDomain} onValueChange={setSelectedSubDomain}>
                        <SelectTrigger data-testid="select-note-subdomain">
                          <SelectValue placeholder={`Select ${newNote.subject} Domain`} />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSubDomains().map((domain) => (
                            <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label>Note Type *</Label>
                    <Select value={newNote.noteType} onValueChange={(value) => setNewNote(prev => ({ ...prev, noteType: value }))}>
                      <SelectTrigger data-testid="select-note-note-type">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="one_pager">One Pager</SelectItem>
                        <SelectItem value="animated">Animated</SelectItem>
                        <SelectItem value="typed">Typed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCreateNote}
                  disabled={createNoteMutation.isPending}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  data-testid="button-add-note"
                >
                  {createNoteMutation.isPending ? "Adding..." : "Add Note"}
                </Button>
              </CardContent>
            </Card>
            
            {/* Existing Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No notes found.</p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4" data-testid={`note-item-${note.id}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold break-words" data-testid={`text-note-title-${note.id}`}>{note.title}</h4>
                            <Badge variant="outline" data-testid={`badge-note-class-${note.id}`}>{note.class}</Badge>
                            <Badge variant="secondary" data-testid={`badge-note-subject-${note.id}`}>{note.subject}</Badge>
                            <Badge data-testid={`badge-note-type-${note.id}`}>{note.noteType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground break-words" data-testid={`text-note-description-${note.id}`}>
                            {note.description || "No description"}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deleteNoteMutation.isPending}
                          data-testid={`button-delete-note-${note.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
