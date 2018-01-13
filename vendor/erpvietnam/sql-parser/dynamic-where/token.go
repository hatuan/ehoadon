package where

// Token represents a lexical token.
type Token int

const (
	// Special tokens
	ILLEGAL Token = iota
	EOF
	WS

	// Literals
	EXPR
	IDENT // main

	// Misc characters
	OR      // |
	BETWEEN // ..
	LIKE    // %
)
