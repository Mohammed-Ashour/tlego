package tui

import (
	"fmt"

	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/charmbracelet/bubbles/list"
)

type groupItem struct {
	group catalog.Group
}

func (i groupItem) Title() string       { return i.group.Name }
func (i groupItem) Description() string { return i.group.URL }
func (i groupItem) FilterValue() string { return i.group.Name }

type tleItem struct {
	summary TLESummary
}

func (i tleItem) Title() string {
	return fmt.Sprintf("%s (%s)", i.summary.Name, i.summary.NoradID)
}

func (i tleItem) Description() string {
	age := ""
	if i.summary.Age > 0 {
		age = FormatAge(i.summary.Age)
	}
	desc := ""
	if age != "" {
		desc = "Age " + age
	}
	if i.summary.OrbitClass != "" {
		if desc != "" {
			desc += " | "
		}
		desc += i.summary.OrbitClass
	}
	return desc
}

func (i tleItem) FilterValue() string {
	return i.summary.Name + " " + i.summary.NoradID
}

func groupsToItems(groups []catalog.Group) []list.Item {
	items := make([]list.Item, 0, len(groups))
	for _, group := range groups {
		items = append(items, groupItem{group: group})
	}
	return items
}

func tleSummariesToItems(items []TLESummary) []list.Item {
	listItems := make([]list.Item, 0, len(items))
	for _, item := range items {
		listItems = append(listItems, tleItem{summary: item})
	}
	return listItems
}
