"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

interface PaginationProps extends React.ComponentProps<"nav"> {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
}

const Pagination = ({
  className,
  currentPage,
  totalPages,
  pageNumbers,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onFirstPage,
  onLastPage,
  ...props
}: PaginationProps) => (
  <nav
    role="navigation"
    aria-label="Pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  >
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious onClick={onPreviousPage} disabled={!hasPreviousPage} />
      </PaginationItem>
      {pageNumbers.map((page, index) =>
        page === -1 ? (
          <PaginationItem key={index}>
            <PaginationEllipsis />
          </PaginationItem>
        ) : (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        )
      )}
      <PaginationItem>
        <PaginationNext onClick={onNextPage} disabled={!hasNextPage} />
      </PaginationItem>
    </PaginationContent>
  </nav>
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean; // Add disabled prop
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  disabled, // Destructure disabled
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
      disabled && "pointer-events-none opacity-50" // Apply disabled styles
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

interface PaginationArrowProps extends React.ComponentProps<typeof PaginationLink> {
  disabled?: boolean; // Explicitly add disabled prop
}

const PaginationPrevious = ({
  className,
  disabled, // Destructure disabled
  ...props
}: PaginationArrowProps) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    disabled={disabled} // Pass disabled to PaginationLink
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Trước</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  disabled, // Destructure disabled
  ...props
}: PaginationArrowProps) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    disabled={disabled} // Pass disabled to PaginationLink
    {...props}
  >
    <span>Sau</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Ellipsis</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
