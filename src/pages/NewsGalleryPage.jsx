import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Newspaper,
  Image,
  Calendar,
  User,
  ArrowRight,
  Upload,
  Eye,
  Clock,
  Camera,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useNewsStore from "@/store/useNewsStore";
import useHomeStore from "@/store/useHomeStore";
import { apiFetch } from "@/lib/api";

const NewsGalleryPage = () => {
  const containerRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });
  const [activeTab, setActiveTab] = useState("news");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleImageIndex, setArticleImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitArticle, setSubmitArticle] = useState({
    title: "",
    content: "",
    author: "",
    email: "",
    submissionType: "article",
  });
  const [submitFiles, setSubmitFiles] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // API-driven state from store
  const storeArticles = useNewsStore((s) => s.articles);
  const storeGallery = useNewsStore((s) => s.gallery);
  const storeCategories = useNewsStore((s) => s.categories);
  const storeLoading = useNewsStore((s) => s.loading);
  const fetchNews = useNewsStore((s) => s.fetchNews);
  const homeContent = useHomeStore((s) => s.content);
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const homeHeroImage = homeContent?.heroImage || "";

  const [newsArticles, setNewsArticles] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  // Sync store data to local state
  useEffect(() => {
    setNewsArticles(storeArticles);
    setGalleryImages(storeGallery);
    const cats = storeCategories.filter((c) => c.isActive).map((c) => c.name);
    setCategories(["All", ...cats]);
    setLoading(storeLoading);
  }, [storeArticles, storeGallery, storeCategories, storeLoading]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append("submissionType", submitArticle.submissionType);
      formData.append("title", submitArticle.title);
      formData.append("content", submitArticle.content);
      formData.append("authorName", submitArticle.author);
      formData.append("authorEmail", submitArticle.email);
      submitFiles.forEach((file) => formData.append("attachments", file));

      const res = await apiFetch("/news-gallery/submit-article", {
        method: "POST",
        body: formData,
      });
      if (!res?.success) throw new Error(res?.message || "Failed to submit");
      setSubmitSuccess(true);
      setSubmitArticle({ title: "", content: "", author: "", email: "", submissionType: "article" });
      setSubmitFiles([]);
      setTimeout(() => {
        setIsSubmitOpen(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const featuredArticle = newsArticles.find((a) => a.isFeatured);
  const otherArticles = newsArticles.filter((a) => !a.isFeatured);

  const handleOpenArticle = async (article) => {
    setArticleImageIndex(0);
    setSelectedArticle(article); // show immediately with what we have
    if (!article.content && article.slug) {
      setArticleLoading(true);
      try {
        const res = await apiFetch(`/news-gallery/articles/${article.slug}`);
        if (res.data) setSelectedArticle(res.data);
      } catch {
        // keep partial data
      } finally {
        setArticleLoading(false);
      }
    }
  };

  const filteredGallery =
    selectedCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  // Reusable image carousel for article cards
  const ArticleImageCarousel = ({ images, title, className = "", autoScroll = false, children }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
      if (autoScroll && images.length > 1) {
        intervalRef.current = setInterval(() => {
          setCurrentIdx((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(intervalRef.current);
      }
    }, [autoScroll, images.length]);

    if (images.length === 0) {
      return (
        <div className={`relative overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>
          <Newspaper className="w-10 h-10 text-gray-400" />
          {children}
        </div>
      );
    }

    return (
      <div className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIdx}
            src={images[currentIdx]}
            alt={`${title} ${currentIdx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-full max-h-full object-contain"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        {children}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIdx((prev) => (prev - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIdx((prev) => (prev + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentIdx(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentIdx ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Gallery lightbox with multi-image navigation
  const GalleryLightbox = ({ images, title, category }) => {
    const [idx, setIdx] = useState(0);
    return (
      <div className="relative">
        <div className="flex items-center justify-center bg-black/90 min-h-[300px]">
          <img
            src={images[idx]}
            alt={`${title} ${idx + 1}`}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIdx((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white text-xl hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIdx((prev) => (prev + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white text-xl hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="font-heading font-bold text-white text-xl">
            {title}
          </h3>
          <p className="text-white/70">{category}</p>
          {images.length > 1 && (
            <p className="text-white/50 text-sm mt-1">{idx + 1} / {images.length}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-hw-base"
      data-testid="news-gallery-page"
      ref={containerRef}
    >
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-orange-50/50 to-amber-50/30" />
          {homeHeroImage && (
            <img
              src={homeHeroImage}
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
          )}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-hw-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-primary/10 to-amber-500/10 text-hw-primary text-sm font-medium mb-6"
            >
              <Newspaper className="w-4 h-4" />
              Updates & Media
            </motion.span>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-hw-text mb-6">
              News &{" "}
              <span className="bg-gradient-to-r from-hw-primary to-amber-500 bg-clip-text text-transparent">
                Gallery
              </span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24"
        ref={ref}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <TabsList className="glass p-1.5 rounded-2xl shadow-lg">
              <TabsTrigger
                value="news"
                data-testid="tab-news"
                className="px-6 py-3 rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-hw-primary data-[state=active]:to-hw-primary-dark data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Newspaper className="w-4 h-4 mr-2" />
                News & Blogs
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                data-testid="tab-gallery"
                className="px-6 py-3 rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Image className="w-4 h-4 mr-2" />
                Gallery
              </TabsTrigger>
            </TabsList>

            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-hw-primary/20 text-hw-primary hover:bg-hw-primary hover:text-white rounded-xl"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Content
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl">
                    Submit Content
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-hw-muted mb-4">
                  Share your healthcare story, article, or gallery images. All submissions are
                  reviewed before publishing.
                </p>
                <form onSubmit={handleSubmitArticle} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-hw-muted mb-2 block">
                      Submission Type
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSubmitArticle({ ...submitArticle, submissionType: "article" })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                          submitArticle.submissionType === "article"
                            ? "border-hw-primary bg-hw-primary/10 text-hw-primary"
                            : "border-gray-200 text-hw-muted hover:border-gray-300"
                        }`}
                      >
                        Article / News
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmitArticle({ ...submitArticle, submissionType: "gallery" })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                          submitArticle.submissionType === "gallery"
                            ? "border-amber-500 bg-amber-500/10 text-amber-600"
                            : "border-gray-200 text-hw-muted hover:border-gray-300"
                        }`}
                      >
                        Gallery
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-hw-muted mb-2 block">
                      {submitArticle.submissionType === "gallery" ? "Gallery Title" : "Article Title"}
                    </label>
                    <Input
                      placeholder="Enter article title"
                      value={submitArticle.title}
                      onChange={(e) =>
                        setSubmitArticle({
                          ...submitArticle,
                          title: e.target.value,
                        })
                      }
                      className="rounded-xl"
                      data-testid="article-title-input"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-hw-muted mb-2 block">
                        Your Name
                      </label>
                      <Input
                        placeholder="Enter your name"
                        value={submitArticle.author}
                        onChange={(e) =>
                          setSubmitArticle({
                            ...submitArticle,
                            author: e.target.value,
                          })
                        }
                        className="rounded-xl"
                        data-testid="article-author-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-hw-muted mb-2 block">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={submitArticle.email}
                        onChange={(e) =>
                          setSubmitArticle({
                            ...submitArticle,
                            email: e.target.value,
                          })
                        }
                        className="rounded-xl"
                        data-testid="article-email-input"
                      />
                    </div>
                  </div>
                  {submitArticle.submissionType === "article" && (
                  <div>
                    <label className="text-sm font-medium text-hw-muted mb-2 block">
                      Article Content
                    </label>
                    <Textarea
                      placeholder="Write your article content"
                      rows={6}
                      value={submitArticle.content}
                      onChange={(e) =>
                        setSubmitArticle({
                          ...submitArticle,
                          content: e.target.value,
                        })
                      }
                      className="rounded-xl"
                      data-testid="article-content-input"
                    />
                  </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-hw-muted mb-2 block">
                      {submitArticle.submissionType === "gallery"
                        ? "Images (required)"
                        : "Attachments (images, PDF, DOC only)"}
                    </label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const allowed = /^(image\/.+|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;
                        const valid = files.filter((f) => allowed.test(f.type));
                        if (valid.length < files.length) {
                          alert("Only images, PDF, and DOC/DOCX files are allowed.");
                        }
                        setSubmitFiles(valid);
                      }}
                      className="rounded-xl"
                      data-testid="article-attachments-input"
                    />
                    {submitFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {submitFiles.map((file, index) => (
                          <p
                            key={`${file.name}-${index}`}
                            className="text-xs text-hw-muted"
                          >
                            {file.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full btn-gradient rounded-xl py-5"
                    data-testid="submit-article-btn"
                  >
                    {submitSuccess
                      ? "Submitted Successfully!"
                      : submitLoading
                        ? "Submitting..."
                        : "Submit for Review"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* News Tab */}
          <TabsContent value="news">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Newspaper className="w-10 h-10 text-hw-primary animate-pulse mb-4" />
                <p className="text-hw-muted">Loading articles...</p>
              </div>
            ) : newsArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Newspaper className="w-12 h-12 text-hw-muted/40 mb-4" />
                <p className="text-hw-muted text-lg">
                  No articles published yet
                </p>
                <p className="text-hw-muted/60 text-sm mt-1">
                  Check back soon for the latest news
                </p>
              </div>
            ) : (
              <>
                {/* Featured Article */}
                {featuredArticle && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                  >
                    <div
                      className="premium-card rounded-3xl overflow-hidden"
                      data-testid="featured-article"
                    >
                      <div className="grid lg:grid-cols-2">
                        <ArticleImageCarousel
                          images={featuredArticle.images?.length ? featuredArticle.images : featuredArticle.image ? [featuredArticle.image] : []}
                          title={featuredArticle.title}
                          className="h-72 lg:h-auto"
                          autoScroll
                        >
                          <span className="absolute top-4 left-4 z-10 inline-flex items-center px-3 py-1.5 rounded-full bg-hw-sos text-white text-xs font-semibold shadow-lg">
                            Featured
                          </span>
                        </ArticleImageCarousel>
                        <div className="p-8 lg:p-10 flex flex-col justify-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-hw-primary/10 text-hw-primary text-xs font-medium w-fit mb-4">
                            {featuredArticle.category}
                          </span>
                          <h2 className="font-heading text-2xl lg:text-3xl font-bold text-hw-text mb-4">
                            {featuredArticle.title}
                          </h2>
                          <p className="text-hw-muted mb-6 line-clamp-3">
                            {featuredArticle.excerpt}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-hw-muted mb-8">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {new Date(
                                featuredArticle.publishedAt,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User className="w-4 h-4" />
                              {featuredArticle.author}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {featuredArticle.readTime}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleOpenArticle(featuredArticle)}
                            className="btn-gradient rounded-xl shadow-lg shadow-hw-primary/20 w-fit"
                          >
                            Read Full Article
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Other Articles Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherArticles.map((article, index) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="premium-card rounded-2xl overflow-hidden group cursor-pointer"
                      data-testid={`article-${article._id}`}
                      onClick={() => handleOpenArticle(article)}
                    >
                      <ArticleImageCarousel
                        images={article.images?.length ? article.images : article.image ? [article.image] : []}
                        title={article.title}
                        className="h-48"
                      >
                        <span className="absolute top-3 left-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 text-hw-text text-xs font-medium">
                          {article.category}
                        </span>
                      </ArticleImageCarousel>
                      <div className="p-5">
                        <h3 className="font-heading font-bold text-hw-text mb-2 line-clamp-2 group-hover:text-hw-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-hw-muted mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-hw-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(article.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                          <span className="flex items-center gap-1 text-hw-primary font-medium">
                            <Eye className="w-4 h-4" />
                            Read
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Camera className="w-10 h-10 text-hw-primary animate-pulse mb-4" />
                <p className="text-hw-muted">Loading gallery...</p>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Camera className="w-12 h-12 text-hw-muted/40 mb-4" />
                <p className="text-hw-muted text-lg">No gallery images yet</p>
                <p className="text-hw-muted/60 text-sm mt-1">
                  Check back soon for photos
                </p>
              </div>
            ) : (
              <>
                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                          : "bg-white/50 text-hw-muted hover:bg-white"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Gallery Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredGallery.map((image, index) => (
                      <motion.div
                        key={image._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className="premium-card rounded-2xl overflow-hidden group cursor-pointer"
                        data-testid={`gallery-image-${image._id}`}
                        onClick={() => setSelectedImage(image)}
                      >
                        <ArticleImageCarousel
                          images={image.images?.length ? image.images : image.image ? [image.image] : []}
                          title={image.title}
                          className="h-48"
                          autoScroll
                        >
                          {(image.images?.length ?? 0) > 1 && (
                            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-xs font-medium text-white bg-black/50 rounded-full">
                              {image.images.length} photos
                            </span>
                          )}
                        </ArticleImageCarousel>
                        <div className="p-4">
                          <h4 className="font-heading font-semibold text-hw-text text-sm mb-1 line-clamp-2 group-hover:text-hw-primary transition-colors">
                            {image.title}
                          </h4>
                          <span className="text-hw-muted text-xs">
                            {image.category}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Article Detail Dialog */}
      <Dialog
        open={!!selectedArticle}
        onOpenChange={(open) => { if (!open) setSelectedArticle(null); }}
      >
        <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <div>
              {/* Image Gallery with auto-scroll */}
              <ArticleImageCarousel
                images={selectedArticle.images?.length ? selectedArticle.images : selectedArticle.image ? [selectedArticle.image] : []}
                title={selectedArticle.title}
                className="h-72 sm:h-96"
                autoScroll
              />
              <div className="p-6 sm:p-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-hw-primary/10 text-hw-primary text-xs font-medium w-fit mb-4">
                  {selectedArticle.category}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-hw-text mb-4">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-6 text-sm text-hw-muted mb-6">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedArticle.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {selectedArticle.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {selectedArticle.readTime}
                  </span>
                </div>
                {articleLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Newspaper className="w-8 h-8 text-hw-primary animate-pulse" />
                  </div>
                ) : selectedArticle.content ? (
                  <div
                    className="prose prose-lg max-w-none text-hw-text prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-p:leading-relaxed prose-headings:text-hw-text prose-a:text-hw-primary break-words overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                  />
                ) : selectedArticle.excerpt ? (
                  <p className="text-hw-muted leading-relaxed">{selectedArticle.excerpt}</p>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden bg-black/90">
          {selectedImage && (() => {
            const imgs = selectedImage.images?.length ? selectedImage.images : selectedImage.image ? [selectedImage.image] : [];
            return (
              <GalleryLightbox
                images={imgs}
                title={selectedImage.title}
                category={selectedImage.category}
              />
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsGalleryPage;
