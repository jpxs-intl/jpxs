function table.find(table, value)
	for k, v in pairs(table) do
		if v == value then
			return k
		end
	end
end

function table.dictLength(dict)
	local len = 0
	for _, _ in pairs(dict) do
		len = len + 1
	end
	return len
end

---@param table table
---@return any[]
function table.flat(table)
	local result = {}
	for _, value in pairs(table) do
		if type(value) == "table" then
			for _, v in pairs(value) do
				table.insert(result, v)
			end
		else
			table.insert(result, value)
		end
	end
	return result
end

---Check if a string starts with another string.
---@param self string Added to avoid typing issues.
---@param start string The string to check against.
---@return boolean startsWith Whether this string starts with the other.
function string.startsWith(self, start)
	return self:sub(1, #start) == start
end

---Check if a string ends with another string.
---@param self string Added to avoid typing issues.
---@param ending string The string to check against.
---@return boolean endsWith Whether this string ends with the other.
function string.endsWith(self, ending)
	return ending == "" or self:sub(-#ending) == ending
end

---Split a string by its whitespace into lines of maximum length.
---@param self string Added to avoid typing issues.
---@param maxLen integer The maximum length of every line.
---@return string[] lines The split lines.
function string.splitMaxLen(self, maxLen)
	local lines = {}
	local line

	local _, _ = self:gsub("(%s*)(%S+)", function(spc, word)
		if not line or #line + #spc + #word > maxLen then
			table.insert(lines, line)
			line = word
		else
			line = line .. spc .. word
		end
	end)

	table.insert(lines, line)
	return lines
end

---Split a string into tokens using a separator character.
---@param self string Added to avoid typing issues.
---@param sep string The separator character.
---@return string[] fields The split tokens.
function string.split(self, sep)
	sep = sep or ":"
	local fields = {}
	local pattern = string.format("([^%s]+)", sep)
	local _, _ = self:gsub(pattern, function(c)
		fields[#fields + 1] = c
	end)
	return fields
end

---Trim whitespace before and after a string.
---@param self string Added to avoid typing issues.
---@return string trimmed The trimmed string.
---@return integer count
function string.trim(self)
	return self:gsub("^%s*(.-)%s*$", "%1")
end
