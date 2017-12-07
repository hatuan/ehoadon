package models

import (
	"reflect"
	"testing"
)

func TestGetIntergerPos(t *testing.T) {
	var tests = []struct {
		s        string
		startPos int
		endPos   int
	}{
		{
			s:        "00000",
			startPos: 0,
			endPos:   4,
		},
		{
			s:        "GL00000",
			startPos: 2,
			endPos:   6,
		},
		{
			s:        "GL00A000",
			startPos: 5,
			endPos:   7,
		},
	}

	for i, tt := range tests {
		numberSequence := NumberSequence{FormatNo: tt.s}
		s, e := numberSequence.getIntegerPos(numberSequence.FormatNo)
		if !reflect.DeepEqual(s, tt.startPos) || !reflect.DeepEqual(e, tt.endPos) {
			t.Errorf("%d. %q: startPos, endPos mismatch:\n   exp=%d,%d\n   got=%d,%d\n", i, tt.s, tt.startPos, tt.endPos, s, e)
		}
	}
}

func TestReplaceNoText(t *testing.T) {
	var tests = []struct {
		formatNo    string
		newNo       int
		fixedLength int
		startPos    int
		endPos      int
		result      string
		err         string
	}{
		{
			formatNo:    `00000`,
			newNo:       10,
			fixedLength: 0,
			startPos:    0,
			endPos:      4,
			result:      `00010`,
		},
		{
			formatNo:    `GL00000`,
			newNo:       10,
			fixedLength: 0,
			startPos:    2,
			endPos:      6,
			result:      `GL00010`,
		},
		{
			formatNo:    `GL00A00`,
			newNo:       999,
			fixedLength: 0,
			startPos:    5,
			endPos:      6,
			result:      `GL00A999`,
		},
		{
			formatNo:    `GL00000`,
			newNo:       10000000000000,
			fixedLength: 0,
			startPos:    2,
			endPos:      6,
			err:         `NumberSequence cannot be extended to more than 15 characters`,
		},
	}

	for i, tt := range tests {
		numberSequence := NumberSequence{FormatNo: tt.formatNo}
		_result, err := numberSequence.replaceNoText(tt.formatNo, tt.newNo, tt.fixedLength, tt.startPos, tt.endPos)
		if !reflect.DeepEqual(tt.err, errstring(err)) {
			t.Errorf("%d. %q: error mismatch:\n   exp=%s\n   got=%s\n", i, tt.formatNo, tt.err, err)
		} else if tt.err == "" && !reflect.DeepEqual(tt.result, _result) {
			t.Errorf("%d. %q: result mismatch:\n   exp=%#v\n   got=%#v\n", i, tt.formatNo, tt.result, _result)
		}
	}
}

// errstring returns the string representation of an error.
func errstring(err error) string {
	if err != nil {
		return err.Error()
	}
	return ""
}
