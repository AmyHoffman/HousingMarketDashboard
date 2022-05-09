# Read Me
Amy Hoffman,
May 2022

## How to Run this Code

This project requires a Python 3 installation and internet connection.

To run this code and view the resulting dashboard follow the following steps:

    1. Unzip the Hoffman_final_project.zip file
    2. Using the command prompt or Visual Studio Code, change directory into this folder with main.html.For the command line use the command 'cd /path/to/your/folder'. For Visual Studio Code go to File -> Open Folder and select this folder.
    3. Start up a Python web server using the command 'python3 -m http.server'. This will start a web server to host this entire directory listing at http://localhost:8000. This approach is built in to any Python installation.
    4. Navigate to http://localhost:8000 in a browser window (preferably Chrome) and select main.html to open it. 
    5. You should now be able to view the final result dashboard.


This dashboard is built off of cleaned and transformed data. The raw data was cleaned and transformed using the python scripts main.py and processor.py. To replicate the data cleaning step follow the following steps:

    1. Open an editor with the capability to run python 3 scripts.
    2. Navigate to and open the main.py file in this folder.
    3. Run the main.py file. 
    4. The dashbboard data files in the output_data subfolder will be recreated. 


## Description of Project

This project was created as a final project for EN 605.662 Data Visualization. 

This was also my first time work with Javascript and D3. Unfamiliar with web-development, I learned a lot about how the different file types HTML, CSS, and JS work together to create a fully functioning webpage. I also became very familiar with D3 visualization development, gaining an understanding of how to create, add, or alter specific components. 

## Future Work

* Visualize the migration population to an area by region 
* Interactive map for all point comparison metrics. This will allow for easier comparison
* Filtering by date range, house-hold type, number of bedrooms (where applicable), state, and county/metropolitan area.
* Percent difference metrics that compare the county/metropolitan area to the United States average should be displayed at the top of the dashboard for supply, demand, home value, and migration.
* Interest rate trends.
