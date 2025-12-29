# Makefile for Ubersicht iCalBuddy-Color Widget
# Creates distribution ZIP for widget gallery

WIDGET_NAME = iCalBuddy-Color.widget
ZIP_FILE = $(WIDGET_NAME).zip
TEMP_DIR = .temp-widget

.PHONY: all zip clean verify

# Default target: create the ZIP
all: zip

# Create distribution ZIP with proper folder structure
zip:
	@echo "Creating $(ZIP_FILE)..."
	@rm -f $(ZIP_FILE)
	@mkdir -p $(TEMP_DIR)/$(WIDGET_NAME)
	@cp index.jsx $(TEMP_DIR)/$(WIDGET_NAME)/
	@cd $(TEMP_DIR) && zip -q -r ../$(ZIP_FILE) $(WIDGET_NAME)
	@rm -rf $(TEMP_DIR)
	@echo "Done: Created $(ZIP_FILE)"
	@echo "  Contents:"
	@unzip -l $(ZIP_FILE)

# Verify ZIP contents
verify:
	@echo "Contents of $(ZIP_FILE):"
	@unzip -l $(ZIP_FILE)

# Remove generated files
clean:
	@echo "Cleaning up..."
	@rm -f $(ZIP_FILE)
	@rm -rf $(TEMP_DIR)
	@echo "Done: Cleaned up"
