import { Contact9 } from "@/components/shadcncraft-examples/blocks/contact-9"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/cn-ui/accordion"
import {
  SectionHeading,
  SectionHeadingTagline,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"

export function FAQs2() {
  return (
    <section className="py-10 lg:py-16">
      <div className="mx-auto flex flex-col gap-12 px-4 lg:px-0">
        {/* Section Heading */}
        <SectionHeading alignment="center" className="mx-auto w-full max-w-2xl">
          <SectionHeadingTagline>FAQ</SectionHeadingTagline>
          <SectionHeadingTitle>Your Questions Answered</SectionHeadingTitle>
        </SectionHeading>

        {/* FAQs */}
        <Accordion defaultValue={["0"]} className="mx-auto w-full max-w-2xl">
          {faqsData.map((faq, index) => (
            <AccordionItem key={faq.title} value={index.toString()}>
              <AccordionTrigger className="text-base">
                {faq.title}
              </AccordionTrigger>
              <AccordionContent>{faq.description}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact Banner*/}
        <div className="mx-auto w-full max-w-2xl">
          <Contact9 />
        </div>
      </div>
    </section>
  )
}

const faqsData = [
  {
    title: "What is Acme AI?",
    description:
      "Acme AI is a personal AI workspace that helps individuals and teams cut context switching, gain clarity, and complete projects faster.",
  },
  {
    title: "Who is Acme AI for?",
    description:
      "It's built for creators, teams, and businesses of all sizes who want to streamline their workflow and make smarter decisions.",
  },
  {
    title: "How much does it cost?",
    description:
      "We offer flexible one-time plans starting at 199 USD. See our pricing section for details.",
  },
  {
    title: "Do I need technical skills to use Acme AI?",
    description:
      "Not at all. Acme AI is designed to work out of the box with minimal setup, and integrates with the tools you already use.",
  },
  {
    title: "Can I try it before I buy?",
    description:
      "Yes — we offer a demo so you can see how Acme AI fits into your workflow.",
  },
  {
    title: "How does Acme AI handle my data?",
    description:
      "Your privacy and security are our top priority. All data is encrypted and never shared with third parties.",
  },
]
