#include <bits/stdc++.h>
using namespace std;
#define no 4

void placeQueen(bool arr[no][no], bool normalDiag[], bool reverseDiag[], bool visitedcol[], int row, string ans)
{
    if (row == no)
    {
        cout << ans << endl;
        return;
    }

    for (int col = 0; col < no; col++)
    {
        if (visitedcol[col] == false && normalDiag[row + col] == false && reverseDiag[row - col + no - 1] == false)
        {
            arr[row][col] = true;
            visitedcol[col] = true;
            normalDiag[row + col] = true;
            reverseDiag[row - col + no - 1] = true;
            placeQueen(arr, normalDiag, reverseDiag, visitedcol, row + 1, ans + to_string(row) + " - " + to_string(col) + ",");
            arr[row][col] = false;
            visitedcol[col] = false;
            normalDiag[row + col] = false;
            reverseDiag[row - col + no - 1] = false;

        }
    }
}
int main()
{

    bool arr[no][no];
    bool visitedcol[no];
    bool normalDiag[2 * no - 1];
    bool reverseDiag[2 * no - 1];

    placeQueen(arr, normalDiag, reverseDiag, visitedcol, 0, "");
}