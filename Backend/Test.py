import pandas as pd
import json

# Load Excel file and sheet
file_path = 'TI-KINDER-Initial-Evaluation-Report-Updated-version-2.xlsx'
df = pd.read_excel(file_path, sheet_name='KINDER QUALIFIED', header=None)

# Extract header information (optional)
header_info = {
    "position": df.iloc[8, 1],
    "education_required": df.iloc[11, 4],
    "training_required": df.iloc[12, 4],
    "experience_required": df.iloc[13, 4],
    "eligibility_required": df.iloc[14, 4]
}

# Combine header rows (row 15 & 16)
header_row_1 = df.iloc[15].fillna("")
header_row_2 = df.iloc[16].fillna("")
combined_headers = []
for h1, h2 in zip(header_row_1, header_row_2):
    if h1 and h2:
        combined_headers.append(f"{h1.strip()} - {h2.strip()}")
    elif h1:
        combined_headers.append(h1.strip())
    elif h2:
        combined_headers.append(h2.strip())
    else:
        combined_headers.append("")

# Load actual data from row 17 onward
data = df.iloc[18:].reset_index(drop=True)
data.columns = combined_headers

# Extract only the needed columns by index
extracted_data = pd.DataFrame({
    'application_code': data.iloc[:, 2],
    'name': data.iloc[:, 4],
    'address': data.iloc[:, 5],        # Column F
    'sex': data.iloc[:, 7],            # Column H
    'recipient': data.iloc[:, 12],
    'education': data.iloc[:, 14],
    'training_title': data.iloc[:, 15],
    'training_hours': data.iloc[:, 16],
    'experience_detail': data.iloc[:, 17],
    'experience_years': data.iloc[:, 18],
    'eligibility': data.iloc[:, 19],
    'remarks': data.iloc[:, 20],
})

# Drop fully empty rows
extracted_data = extracted_data.dropna(how='all')

combined_data = []
for _, row in extracted_data.iterrows():
    applicant_data = row.to_dict()
    applicant_data.update(header_info)
    combined_data.append(applicant_data)

# Convert and print to JSON
json_output = json.dumps(combined_data, indent=4)
print(json_output)
