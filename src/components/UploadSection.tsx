import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Check, Heart, PartyPopper, Sparkles } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const UploadSection = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Apps Script Web App URL - using the existing URL but it should be updated after deployment
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9tyQkhODnfKHNw3uyywfxwdECjcNVrzyMpNvemcnV9lHHiJ3M0m7Bz2W0gtvggGzF/exec';

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      instagram: "",
      twitter: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectedFile = (file: File) => {
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
        });
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Photo uploaded successfully",
        description: "Now fill in your details to complete the process",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Define onSubmit handler that will be passed to form.handleSubmit
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      if (!selectedFile) {
        throw new Error("No file selected");
      }
      console.log("Uploading file:", selectedFile.name);
      formData.append('file', selectedFile);
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('instagram', data.instagram || "");
      formData.append('twitter', data.twitter || "");
      
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData,
        
      });

      console.log("Submission complete");
      setSubmitSuccess(true);
      setShowConfirmation(true);
      
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Error submitting form",
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="upload" className="py-16 px-4">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title text-center">Upload Your Photo</h2>
          
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8 mt-8">
            <div 
              className={`upload-box mb-8 ${isDragging ? 'border-ghibli-purple bg-ghibli-light/60' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              
              {preview ? (
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-56 rounded-lg object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button 
                      className="ghibli-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <svg 
                    className="mx-auto h-12 w-12 text-ghibli-magenta mb-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG, GIF (MAX. 5MB)</p>
                </div>
              )}
            </div>
            
            {preview && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-semibold text-center mb-6">Enter Your Details</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name <span className="text-ghibli-magenta">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} className="ghibli-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address <span className="text-ghibli-magenta">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" {...field} className="ghibli-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="@yourusername" 
                                {...field} 
                                className="ghibli-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="@yourusername" 
                                {...field} 
                                className="ghibli-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-center pt-2">
                      <Button 
                        type="submit" 
                        className="ghibli-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </div>
                        ) : (
                          "Transform to Ghibli Style"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
                
                <p className="mt-6 text-sm text-gray-600 text-center">
                  Your portrait will be ready within 24-48 hours
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Success Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-gradient-to-br from-[#ee2a7b]/95 to-[#6228d7]/95 border-none text-white max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-white flex justify-center mb-2">
              <Heart className="h-8 w-8 mr-2 fill-white" />
              Thank You!
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 flex flex-col items-center">
            <div className="bg-white/30 rounded-full p-4 mb-6">
              <Check className="h-16 w-16 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-center">
              Your Ghibli transformation is underway!
            </h3>
            
            <div className="space-y-3 text-center">
              <p className="text-white/90">
                We've received your photo and details and we're excited to create your Ghibli-style portrait!
              </p>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <p className="font-medium">Ready in 24-48 hours</p>
                <Sparkles className="h-5 w-5 text-yellow-300" />
              </div>
            </div>
            
            <div className="flex items-center mt-8 bg-white/20 rounded-lg p-3">
              <Award className="h-6 w-6 text-yellow-300 mr-3" />
              <p className="text-sm">Your portrait will be created with love and attention to detail</p>
            </div>
            
            <Button 
              onClick={() => setShowConfirmation(false)} 
              className="mt-8 bg-white text-[#ee2a7b] hover:bg-white/90 hover:text-[#ee2a7b] border-none"
            >
              <PartyPopper className="h-4 w-4 mr-2" />
              Can't Wait!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Original success message (kept for redundancy) */}
      {submitSuccess && !showConfirmation && (
        <div className="text-center mt-8 p-6 bg-ghibli-light rounded-lg border border-ghibli-magenta animate-scale-in">
          <svg className="h-16 w-16 text-ghibli-magenta mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-gray-600">
            We've received your image and information. Your Ghibli portrait will be ready in 24-48 hours.
          </p>
        </div>
      )}
    </section>
  );
};

export default UploadSection;
