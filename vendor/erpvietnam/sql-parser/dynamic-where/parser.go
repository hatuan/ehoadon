package where

import (
	"fmt"
	"io"
)

type WhereStatement struct {
	Parts []string
	//Conditon string
}

// Parser represents a parser.
type Parser struct {
	s   *Scanner
	buf struct {
		tok Token  // last read token
		lit string // last read literal
		n   int    // buffer size (max=1)
	}
}

// NewParser returns a new instance of Parser.
func NewParser(r io.Reader) *Parser {
	return &Parser{s: NewScanner(r)}
}

func (p *Parser) Parse() (*WhereStatement, error) {
	stmt := &WhereStatement{}

	// Next we should loop over all our comma-delimited fields.
	for {
		// Read a field.
		tok, lit := p.scanIgnoreWhitespace()
		//fmt.Printf("tok = %d lit = %s\n", tok, lit)
		if tok != IDENT && tok != LIKE {
			return nil, fmt.Errorf("found %q, expected IDENT or LIKE", lit)
		}

		if tok == LIKE {
			nextTok, nextLit := p.scanIgnoreWhitespace()
			//fmt.Printf("nextTok = %d nextLit = %s\n", nextTok, nextLit)
			if nextTok != IDENT {
				if nextTok != OR && nextTok != EOF {
					return nil, fmt.Errorf("found %q, expected OR or EOF", nextLit)
				}
				stmt.Parts = append(stmt.Parts, "{id} LIKE (E'"+lit+"')")
				p.unscan()
			} else {
				nextTok2, nextLit2 := p.scanIgnoreWhitespace()
				//fmt.Printf("nextTok2 = %d nextLit2 = %s\n", nextTok2, nextLit2)
				if nextTok2 != LIKE {
					stmt.Parts = append(stmt.Parts, "{id} LIKE (E'"+lit+nextLit+"')")
					p.unscan()
				} else {
					stmt.Parts = append(stmt.Parts, "{id} LIKE (E'"+lit+nextLit+nextLit2+"')")
					nextTok3, nextLit3 := p.scanIgnoreWhitespace()
					//fmt.Printf("nextTok3 = %d nextLit3 = %s\n", nextTok3, nextLit3)
					if nextTok3 != OR && nextTok3 != EOF {
						return nil, fmt.Errorf("found %q, expected OR or EOF", nextLit3)
					}
					p.unscan()
				}
			}
		} else if tok == IDENT {
			nextTok, nextLit := p.scanIgnoreWhitespace()
			//fmt.Printf("nextTok = %d nextLit = %s\n", nextTok, nextLit)
			if nextTok == LIKE {
				stmt.Parts = append(stmt.Parts, "{id} LIKE (E'"+lit+nextLit+"')")
			} else if nextTok == BETWEEN {
				nextTok2, nextLit2 := p.scanIgnoreWhitespace()
				//fmt.Printf("nextTok2 = %d nextLit2 = %s\n", nextTok2, nextLit2)
				if nextTok2 != BETWEEN {
					return nil, fmt.Errorf("found %q, expected OR", nextLit2)
				}
				nextTok3, nextLit3 := p.scanIgnoreWhitespace()
				//fmt.Printf("nextTok3 = %d nextLit3 = %s\n", nextTok3, nextLit3)
				if nextTok3 != IDENT {
					return nil, fmt.Errorf("found %q, expected INDENT", nextLit3)
				}
				nextTok4, nextLit4 := p.scanIgnoreWhitespace()
				//fmt.Printf("nextTok4 = %d nextLit4 = %s\n", nextTok4, nextLit4)
				if nextTok4 != OR && nextTok4 != EOF {
					return nil, fmt.Errorf("found %q, expected OR or EOF", nextLit4)
				} else {
					stmt.Parts = append(stmt.Parts, "{id} BETWEEN (E'"+lit+"') AND (E'"+nextLit3+"')")
					p.unscan()
				}
			} else {
				stmt.Parts = append(stmt.Parts, "{id} = (E'"+lit+"')")
				p.unscan()
			}
		}

		tok, lit = p.scanIgnoreWhitespace()
		//fmt.Printf("tok = %d lit = %s\n", tok, lit)
		if tok == EOF {
			break
		}
		if tok == OR {
			stmt.Parts = append(stmt.Parts, " OR ")
		}
	}

	// Return the successfully parsed statement.
	return stmt, nil
}

// scan returns the next token from the underlying scanner.
// If a token has been unscanned then read that instead.
func (p *Parser) scan() (tok Token, lit string) {
	// If we have a token on the buffer, then return it.
	if p.buf.n != 0 {
		p.buf.n = 0
		return p.buf.tok, p.buf.lit
	}

	// Otherwise read the next token from the scanner.
	tok, lit = p.s.Scan()

	// Save it to the buffer in case we unscan later.
	p.buf.tok, p.buf.lit = tok, lit

	return
}

// scanIgnoreWhitespace scans the next non-whitespace token.
func (p *Parser) scanIgnoreWhitespace() (tok Token, lit string) {
	tok, lit = p.scan()
	if tok == WS {
		tok, lit = p.scan()
	}
	return
}

// unscan pushes the previously read token back onto the buffer.
func (p *Parser) unscan() { p.buf.n = 1 }
