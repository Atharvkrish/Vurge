import { useState } from "react";
import { useListMicroInternships } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, Euro, Building2, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function MicroInternshipsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const { data, isLoading } = useListMicroInternships(
    {
      search: debouncedSearch || undefined,
      limit: 50,
    },
    {
      query: {
        queryKey: ["micro-internships", debouncedSearch],
      }
    }
  );

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">Micro-Internships</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Short-term, paid projects designed to build your CV while fitting perfectly around your studies and visa constraints.
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search projects..." 
                className="pl-10 h-12 text-base bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">Search</Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl font-bold text-muted-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((project) => (
              <Link key={project.id} href={`/micro-internships/${project.id}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <Badge variant={project.status === 'OPEN' ? 'default' : 'secondary'} className={project.status === 'OPEN' ? 'bg-emerald-600' : ''}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <div className="font-bold text-lg text-primary flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                        {project.budget}
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-xl leading-tight line-clamp-2">{project.title}</h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground mt-2 text-sm">
                      <Building2 className="w-4 h-4" />
                      <span className="truncate">{project.employer?.companyName || "Unknown Company"}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="line-clamp-3 text-sm text-muted-foreground mb-4">
                      {project.description || "No description provided."}
                    </p>
                    {project.skills && project.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs font-normal bg-muted/50">{skill}</Badge>
                        ))}
                        {project.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs font-normal bg-muted/50">+{project.skills.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 border-t mt-auto px-6 py-4 flex items-center justify-between text-sm text-muted-foreground bg-muted/20">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{project.duration || "Flexible"}</span>
                    </div>
                    {project.deadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>By {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
