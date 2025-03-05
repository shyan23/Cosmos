import psycopg2
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import openpyxl
from Backend.DB.Config import get_db_connection


wb = openpyxl.load_workbook()
