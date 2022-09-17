# This script bumps the version of the file. Use major, minor, or micro to bump the version.
# The version will only be bumped going forward, reverting is not intended.
import argparse
import os
import fileinput

# Bumps the version of a version file
# Takes the path to a version file containing a single line in the format X.Y.Z
# Bumps the version depending on the bool flags passed to the function
def bump_version(file_path, major, minor, micro, verbose):
    separator = "."
    version = [0,0,0]
    with open(file_path, "r") as file:
        line = file.read()
        if verbose:
            print("Current version before bumping is: {}").format(line)
        data = line.split(separator)
        version[0] = int(data[0])
        version[1] = int(data[1])
        version[2] = int(data[2])

        # Bump only largest version and set the others to 0.
        # This logic also allows to bump two versions in one call starting from 0 again after the largest version is bumped.
        if major:
            version[0] += 1
            version[1] = 0
            version[2] = 0
        if minor:
            version[1] += 1
            version[2] = 0
        if micro:
            version[2] += 1

    version_string = str(version[0]) + "." + str(version[1]) + "." + str(version[2])
    if verbose:
        print("New version after bumping is: {}").format(version_string)
    with open(file_path, "w") as file:
        file.write(version_string)

# This takes the version file and read the current version, then overwrites the version in the .env file. The .env
# file is ingested by react so the env variables can be read from inside the react application.
def write_to_env(version_file, env_file, version_env_var_name):
    version_line = ""
    with open(version_file, "r") as file:
        version_line = file.read()

    for line in fileinput.input(env_file, inplace=True):
        if (line.find(version_env_var_name) != -1):
            print('{}={}'.format(version_env_var_name, version_line))
        elif len(line) > 1:
            print(line)

if __name__ == "__main__":
    version_file_name = "version.txt"
    script_folder = os.path.dirname(os.path.realpath(__file__))
    # The version file is one level under the script folder
    version_file_path = os.path.normpath(script_folder + "/../" + version_file_name)

    parser = argparse.ArgumentParser(description="Bump the version in the version.txt of the application. If a larger version is bumped the following versions are set to 0 unless they are also explicitly passed")
    parser.add_argument("--major", action="store_true", default=False,
                        help="Bump major version X.0.0")
    parser.add_argument("--minor", action="store_true", default=False,
                        help="Bump minor version 0.Y.0")
    parser.add_argument("--micro", action="store_true", default=False,
                        help="Bump micro version 0.0.Z")
    parser.add_argument("--file", action="store", default=version_file_path,
                        help="Path to version file. Default is version.txt in root directory")
    parser.add_argument("-v", "--verbose", action="store_true", default=False,
                        help="Prints information to console like path to file, current version, and bumped version.")
    args = parser.parse_args()

    if args.verbose:
        print("Using version file: {}").format(args.file)
    bump_version(args.file, args.major, args.minor, args.micro, args.verbose)

    env_id = "REACT_APP_VERSION"
    env_file_path = ".env"
    write_to_env(args.file, env_file_path, env_id)

