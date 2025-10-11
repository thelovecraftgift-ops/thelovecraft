import { motion } from "framer-motion";
import { Crown, Gem, Heart, Sparkles, Award, Users, Gift, Star, Flower } from "lucide-react";

const AboutSection = () => {
  // Updated stats with pink/rose/burgundy colors
  const features = [
    {
      icon: Heart,
      title: "Handcrafted with Heart",
      description:
        "Every piece is lovingly made by skilled artisans — filled with warmth, care, and emotion.",
      color: "from-pink-100 to-rose-100",
    },
    {
      icon: Flower,
      title: "Made in India, Made with Love",
      description:
        "Proudly crafted by Indian hands that turn every emotion into something beautiful.",
      color: "from-rose-100 to-pink-100",
    },
    {
      icon: Gift,
      title: "Gifts that Speak Emotions",
      description:
        "From joy to romance, our creations express what words sometimes can’t.",
      color: "from-pink-100 to-fuchsia-100",
    },
    {
      icon: Star,
      title: "Trusted by Happy Hearts",
      description:
        "Thousands of smiles delivered — and countless more on the way.",
      color: "from-rose-100 to-pink-100",
    },
  ];

  // Handle broken images gracefully
  const handleImageError = (e) => {
    e.target.style.display = "none";
    if (e.target.parentElement) e.target.parentElement.style.display = "none";
  };

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Decorative background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-r from-rose-200/20 to-pink-200/20 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-r from-pink-200/25 to-red-200/15 blur-3xl"></div>

      {/* Floating sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full opacity-40"
          style={{
            top: `${15 + i * 14}%`,
            right: `${10 + i * 8}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-6 py-3 rounded-2xl border border-rose-200/50 font-bold text-sm flex items-center space-x-2">
                <Crown className="w-5 h-5 text-rose-600" />
                <span>Our Heritage Story</span>
                <Sparkles className="w-5 h-5 text-pink-600" />
              </div>
            </motion.div>

            <motion.h2
              className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Where Ancient Artistry
              <br />
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 bg-clip-text text-transparent">
                Meets Modern Elegance
              </span>
            </motion.h2>

            <motion.p
              className="text-xl text-rose-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              For over a decade, we've preserved the sacred art of Indian jewelry
              craftsmanship, transforming precious metals and gems into timeless
              treasures that tell your unique story.
            </motion.p>
          </motion.div>

          {/* Heritage + Image Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
            <motion.div
              className="lg:col-span-7 space-y-8"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Story Cards */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-rose-100/50 shadow-xl">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Born from Passion
                    </h3>
                    <p className="text-rose-600 leading-relaxed">
                      Our journey began in the bylanes of traditional Indian
                      craftsmanship, where master artisans shared their
                      centuries-old secrets with us.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-3xl p-8 border border-rose-100/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Master Craftsmen Legacy
                    </h3>
                    <p className="text-rose-600 leading-relaxed mb-4">
                      Every piece is touched by hands that have mastered ancient
                      techniques like Kundan, Jadau, and Meenakari.
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-rose-700">
                      <span className="flex items-center">
                        <Gem className="w-4 h-4 mr-1" /> Hand-Forged
                      </span>
                      <span className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" /> Traditional
                        Techniques
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image collage */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                <motion.div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=700&fit=crop"
                    alt="Master craftsman creating jewelry"
                    className="w-full h-[500px] object-cover"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                    <p className="text-gray-800 font-medium mb-2 italic">
                      "Each creation carries the soul of its maker, the dreams
                      of its wearer."
                    </p>
                    <p className="text-rose-600 font-bold text-sm">
                      - Our Master Artisans
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Features Cards */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {features.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-rose-100 p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 * index }}
              >
                <div
                  className={`w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center`}
                >
                  <item.icon className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-rose-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Values Section */}
          <motion.div
            className="bg-gradient-to-r from-rose-100/50 via-white to-pink-100/50 rounded-3xl p-12 border border-rose-200/30 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Crafted with{" "}
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 bg-clip-text text-transparent">
                Purpose
              </span>
            </h3>

            <p className="text-lg text-rose-600 max-w-4xl mx-auto leading-relaxed mb-8">
              We believe jewelry is more than decoration—it's a language of
              love, celebration, and memory. Every curve, every sparkle, every
              detail is infused with intention, carrying forward a legacy of
              artisanship that honors both tradition and your personal journey.
            </p>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-rose-700">
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-2" /> Made with Love
              </span>
              <span className="flex items-center">
                <Crown className="w-4 h-4 mr-2" /> Royal Quality
              </span>
              <span className="flex items-center">
                <Gem className="w-4 h-4 mr-2" /> Ethical Sourcing
              </span>
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-2" /> Lifetime Guarantee
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
