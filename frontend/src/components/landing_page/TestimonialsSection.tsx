const testimonials = [
  {
    id: 1,
    content: "Company Lens nous fait gagner des heures d'analyse. En quelques clics, nous avons toutes les informations nécessaires pour évaluer nos partenaires commerciaux. L'interface est intuitive et les données sont toujours à jour.",
    author: {
      name: 'Marie Dubois',
      role: 'Directrice Financière',
      company: 'Groupe Delhaize',
      image: '👩‍💼',
    },
    rating: 5,
  },
  {
    id: 2,
    content: "Grâce à Company Lens, nous pouvons analyser rapidement la santé financière de nos prospects. C'est devenu un outil indispensable pour notre équipe commerciale. La qualité des rapports est exceptionnelle.",
    author: {
      name: 'Pierre Van Den Berg',
      role: 'Responsable Commercial',
      company: 'Proximus',
      image: '👨‍💻',
    },
    rating: 5,
  },
  {
    id: 3,
    content: "L'outil parfait pour notre due diligence. Les informations sont complètes, fiables et présentées de manière claire. Company Lens nous aide à prendre des décisions éclairées en toute confiance.",
    author: {
      name: 'Sophie Janssen',
      role: 'Associée',
      company: 'Deloitte Belgium',
      image: '👩‍⚖️',
    },
    rating: 5,
  },
];

const TestimonialsSection = () => (
  <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-base font-semibold leading-7 text-blue-600">Témoignages</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Ce que disent nos clients
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Découvrez comment Company Lens transforme l'analyse d'entreprises pour les professionnels belges
        </p>
      </div>

      <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="group relative">
              <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 hover:shadow-xl hover:ring-blue-300 transition-all duration-300">
                {/* Quote icon */}
                <div className="absolute top-4 right-4">
                  <svg className="h-8 w-8 text-blue-200 group-hover:text-blue-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>

                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-900">
                  <p className="text-base leading-7">{testimonial.content}</p>
                </blockquote>

                {/* Author */}
                <div className="mt-6 flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-2xl">
                    {testimonial.author.image}
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-semibold text-gray-900">
                      {testimonial.author.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.author.role}
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {testimonial.author.company}
                    </div>
                  </div>
                </div>

                {/* Decorative background */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional social proof */}
      <div className="mt-20 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-gray-900">4.9/5</span>
                <span className="ml-1">note moyenne</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div>
                <span className="font-semibold text-gray-900">98%</span>
                <span className="ml-1">de clients satisfaits</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div>
                <span className="font-semibold text-gray-900">24h</span>
                <span className="ml-1">temps de réponse moyen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TestimonialsSection;