const features = [
  {
    title: 'Study',
    description: 'Long sessions that deserve atmosphere.',
  },
  {
    title: 'Deep work',
    description: 'Uninterrupted focus, beautifully framed.',
  },
  {
    title: 'Creative sessions',
    description: 'When your screen should match your headspace.',
  },
  {
    title: 'Desk setups',
    description: 'It belongs on your desk like any other object.',
  },
]

export default function Section2() {
  return (
    <section className="w-full flex flex-col gap-[40px] items-center pb-[200px]">
      {/* Title */}
      <div className="flex flex-col gap-4 items-center text-center px-4">
        <h2 className="font-aspekta uppercase text-[28px] md:text-[40px] leading-[1.3] text-[#343434]">
          for people who<br />
          romanticize productivity.
        </h2>
        <p className="font-pretendard text-[16px] text-[#343434] tracking-[-0.08px] leading-[1.4] w-full md:w-[448px]">
          It&apos;s getting harder to protect our attention.<br className="hidden md:block" />
          Notifications, endless feeds, and constant stimulation compete for it every day.<br className="hidden md:block" />
          We&apos;re building a space for people who want it back.
        </p>
      </div>

      {/* Feature grid — 1 col on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-[100px] w-full">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-6">
            <div className="w-full h-[300px] rounded-lg overflow-hidden relative bg-[#D9D9D9]">
              <img
                src="/images/feature-placeholder.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-inter font-medium text-[30px] text-[#343434] tracking-[-1.5px] leading-[1.3]">
                {feature.title}
              </p>
              <p className="font-pretendard text-[16px] text-[#343434] tracking-[-0.08px] leading-[1.4]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
