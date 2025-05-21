// components/Heading.tsx
interface HeadingProps {
    children: React.ReactNode;
    className?: string;
  }
  
  const Heading = ({ children, className = "" }: HeadingProps) => (
    <h1 className={`text-4xl md:text-5xl font-bold text-[#1A3C2D] text-center py-8 leading-tight tracking-tight ${className}`}>
      {children}
    </h1>
  );
  
  export default Heading;
  