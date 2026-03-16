import { Star, TrendingUp, Users, Target } from 'lucide-react';

export default function SocialProof() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      company: 'Google',
      text: 'Got 3 interviews within a week of using ResumeFit. The ATS optimization really works!',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager',
      company: 'Meta',
      text: 'My resume was getting rejected everywhere. After optimization, I landed 5 interviews in 2 weeks.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Data Scientist',
      company: 'Microsoft',
      text: 'The keyword matching is incredible. Finally got past the ATS and into real interviews.',
      rating: 5,
    },
  ];

  const stats = [
    {
      icon: TrendingUp,
      value: '3.2x',
      label: 'More Interviews',
      description: 'Average increase in interview invitations',
    },
    {
      icon: Users,
      value: '10K+',
      label: 'Resumes Optimized',
      description: 'Professionals trust ResumeFit',
    },
    {
      icon: Target,
      value: '89%',
      label: 'ATS Pass Rate',
      description: 'Resumes that pass ATS screening',
    },
  ];

  return (
    <div className="space-y-8 mb-8">
      {/* Stats */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 mb-2">
                <stat.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs font-semibold text-gray-700">{stat.label}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">
          Loved by job seekers at top companies
        </h3>
        <div className="grid gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-sm text-gray-900">{testimonial.name}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {testimonial.role} at {testimonial.company}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
